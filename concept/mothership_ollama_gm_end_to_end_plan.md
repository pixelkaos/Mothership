
# Mothership Companion — Local Ollama **AI Game Master** (End‑to‑End Plan)

This guide turns your local **Ollama** model (e.g., `tohur/natsumura` storytelling Llama 3.1) into an **AI Game Master (GM)** for the Mothership Companion.  
It covers: a stable **system persona** (Modelfile), a local **RAG** stack for rules/tables/campaigns, a streaming **chat API** with **tool calls** for dice & lookups, and a small **front‑end hook**.

> **Goal**: The model narrates and adjudicates using *retrieved* Mothership rules/tables, never fakes dice, and can ask for specific rolls via a simple JSON **TOOL** protocol.

---

## 0) Prerequisites

- **Ollama** running locally (default API: `http://localhost:11434`)
- Your narrative model available locally (pull the exact tag you prefer):
  ```bash
  ollama pull tohur/natsumura:latest
  ```
- Node 18+ (or Bun/Deno).  
- **Qdrant** via Docker for local vector search (very light‑weight).  
- Your knowledge base files in `kb/` (`.md`, `.txt`, or converted `.pdf`).

> **Tip**: Keep copyrighted PDFs out of client bundles; index them locally and store only vectors.

---

## 1) GM **Modelfile** (persona, rules, tool protocol)

Create `Modelfile` at the repo root:

```text
# Replace FROM with your exact local model
FROM tohur/natsumura:latest

SYSTEM """
You are the **MOTHERSHIP Game Master** for a sci‑fi horror RPG.
You narrate scenes, ask questions, and apply Mothership rules precisely.
You **never** roll dice yourself; you request rolls using TOOL CALLS.
Use retrieved rules as source of truth; cite them as [n] when present.

TOOL CALL PROTOCOL
- When a roll or lookup is needed, emit a single JSON object on its own line:
  TOOL: {"tool":"rollDice","expr":"2d10+5","reason":"wound damage"}
  or
  TOOL: {"tool":"lookup","table":"panic","key":"result=13"}
- Then **wait** for the tool result and continue. Do not invent outcomes.

OUTPUT STYLE
- Brief, vivid, second‑person narration in Markdown.
- Headings for scenes, bullets for options, compact blockquotes for mechanics.
"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 8192     # raise if you have VRAM and long context
PARAMETER num_predict 512
```

Build and sanity‑check:

```bash
ollama create mothership-gm -f Modelfile
ollama run mothership-gm
```

---

## 2) Retrieval‑Augmented Generation (**RAG**) with Qdrant

We’ll index rules, tables, and campaign notes → retrieve relevant passages per turn.

### 2.1 Run Qdrant

```bash
docker run -p 6333:6333 -v qdrant_data:/qdrant/storage qdrant/qdrant
```

### 2.2 Prepare the KB

Put sources in `kb/`. Convert PDFs to text/markdown (choose the cleanest path for your docs):

```bash
# examples only — use the tool that preserves your docs best
pdftotext -layout rules.pdf kb/rules.txt
pandoc -s gm-tables.pdf -t markdown -o kb/gm-tables.md
```

### 2.3 Ingest script (Node/TypeScript)

Create `scripts/ingest.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

/* Settings */
const KB_DIR = 'kb';
const OLLAMA = 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text';
const QDRANT = 'http://localhost:6333';
const COLLECTION = 'mothership_kb';

/* Helpers */
async function embed(texts: string[]) {
  const res = await fetch(`${OLLAMA}/api/embed`, {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ model: EMBED_MODEL, input: texts })
  });
  const j = await res.json();
  return j.embeddings as number[][];
}

function chunk(text: string, max = 1000, overlap = 150) {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + max));
    i += (max - overlap);
  }
  return out;
}

async function ensureCollection() {
  await fetch(`${QDRANT}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({
      vectors: { size: 768, distance: 'Cosine' } // 768 for nomic-embed-text
    })
  });
}

async function upsert(points: any[]) {
  await fetch(`${QDRANT}/collections/${COLLECTION}/points?wait=true`, {
    method: 'PUT',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ points })
  });
}

(async () => {
  await ensureCollection();

  const files = fs.readdirSync(KB_DIR).filter(f => /\.(md|txt)$/i.test(f));
  for (const file of files) {
    const full = path.join(KB_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const chunks = chunk(raw);
    const vecs = await embed(chunks);

    const points = vecs.map((v, i) => ({
      id: `${file}-${i}`,
      vector: v,
      payload: { file, idx: i, text: chunks[i] }
    }));

    await upsert(points);
    console.log(`Indexed ${file}: ${chunks.length} chunks`);
  }
})();
```

Run:

```bash
node scripts/ingest.ts
```

---

## 3) Retrieval helper

Create `src/server/rag.ts`:

```ts
import fetch from 'node-fetch';
const OLLAMA = 'http://localhost:11434';
const QDRANT = 'http://localhost:6333';
const COLLECTION = 'mothership_kb';

export type Snippet = { file:string; idx:number; text:string; score:number };

export async function retrieve(query: string, topK=6): Promise<Snippet[]> {
  // 1) embed query
  const er = await fetch(`${OLLAMA}/api/embed`, {
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ model:'nomic-embed-text', input: [query] })
  });
  const ej = await er.json();
  const vec = ej.embeddings[0];

  // 2) search
  const sr = await fetch(`${QDRANT}/collections/${COLLECTION}/points/search`, {
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({ vector: vec, limit: topK, with_payload: true })
  });
  const sj = await sr.json();

  return (sj.result || []).map((r:any) => ({
    file: r.payload.file,
    idx: r.payload.idx,
    text: r.payload.text,
    score: r.score
  }));
}

export function formatContext(snippets: Snippet[]) {
  const body = snippets.map((s, i) =>
`[${i+1}] FILE: ${s.file}
${s.text}`).join('\n\n---\n\n');

  const cites = snippets.map((s,i)=>`[${i+1}] ${s.file}#${s.idx}`).join(', ');
  return { body, cites };
}
```

---

## 4) Chat pipeline with **TOOL calls** (dice & lookups) + streaming

Create `src/server/gmChat.ts`:

```ts
import fetch from 'node-fetch';
import { retrieve, formatContext } from './rag';

const OLLAMA = 'http://localhost:11434';
const MODEL  = 'mothership-gm';

export type Msg = { role:'user'|'assistant'|'system'; content:string };

export async function gmTurn(history: Msg[], userInput: string, opts?: {temperature?:number}) {
  // 1) RAG
  const snippets = await retrieve(userInput);
  const { body:context, cites } = formatContext(snippets);

  // 2) Build messages
  const sys = {
    role: 'system',
    content:
`CONTEXT (from KB; cite with [n]):
${context}

CITATIONS: ${cites}

Follow TOOL CALL protocol if dice/lookup needed.`
  };

  const messages = [sys, ...history, { role:'user', content:userInput }];

  // 3) Call Ollama chat (streaming)
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      options: { temperature: opts?.temperature ?? 0.7 }
    })
  });

  let toolCall: any | null = null;
  const decoder = new TextDecoder();
  for await (const chunk of (res.body as any)) {
    const text = decoder.decode(chunk);
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      const ev = JSON.parse(line); // Ollama streams JSON events per line
      if (ev.message?.content) {
        const piece = ev.message.content;
        if (/^TOOL:\s*\{/.test(piece.trim())) {
          try { toolCall = JSON.parse(piece.trim().replace(/^TOOL:\s*/,'')); }
          catch {}
        } else {
          process.stdout.write(piece); // stream to client
        }
      }
    }
  }

  // 4) Handle tool call if present
  if (toolCall) {
    const toolResult = await runTool(toolCall);  // connect to your dice/tables
    const cont = await fetch(`${OLLAMA}/api/chat`, {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({
        model: MODEL,
        messages: [...messages, { role:'assistant', content: `TOOL RESULT: ${JSON.stringify(toolResult)}` }],
        stream: false
      })
    });
    const final = await cont.json();
    return final.message?.content ?? '';
  }

  return '';
}

async function runTool(call:{tool:string, expr?:string, table?:string, key?:string, reason?:string}) {
  if (call.tool === 'rollDice' && call.expr) {
    // TODO: call your RANDSUM dice roller here
    return { expr: call.expr, rolls:[3,7], total:10, reason: call.reason || '' };
  }
  if (call.tool === 'lookup' && call.table) {
    // TODO: lookup from your GM tables (JSON or RAG)
    return { table: call.table, key: call.key || '', result: 'Panic rises. Drop item.' };
  }
  return { error: 'Unknown tool call' };
}
```

Create a simple server route (Express example) `src/server/index.ts`:

```ts
import express from 'express';
import bodyParser from 'body-parser';
import { gmTurn, Msg } from './gmChat';

const app = express();
app.use(bodyParser.json());

app.post('/api/gm', async (req, res) => {
  const { prompt, history } = req.body as { prompt:string, history: Msg[] };
  try {
    const text = await gmTurn(history || [], prompt);
    res.type('text/plain').send(text);
  } catch (e:any) {
    res.status(500).send(e?.message || 'GM error');
  }
});

app.listen(8787, () => console.log('GM server on http://localhost:8787'));
```

---

## 5) Front‑end hook (React)

```ts
// src/hooks/useGameMaster.ts
import { useRef, useState } from 'react';

type Msg = { role:'user'|'assistant', content:string };

export function useGameMaster() {
  const [history, setHistory] = useState<Msg[]>([]);
  const abortRef = useRef<AbortController|null>(null);

  async function ask(prompt: string) {
    setHistory(h => [...h, { role:'user', content: prompt }]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const res = await fetch('/api/gm', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ prompt, history }),
      signal: abortRef.current.signal
    });

    const text = await res.text();
    setHistory(h => [...h, { role:'assistant', content: text }]);
  }

  function stop(){ abortRef.current?.abort(); }

  return { history, ask, stop };
}
```

You can render `history` and wire `ask()` to a text box; use your existing “floating panels” UI.

---

## 6) Prompt patterns (copy‑paste)

- **Scene kick‑off**
  ```
  Set the scene aboard a derelict transport near LV‑327. Ask the players one
  pointed question. Focus on sensory detail and one immediate threat.
  ```

- **Rules explanation (with citations)**
  ```
  Explain Panic checks in Mothership using retrieved context only. List the
  steps briefly and cite as [n].
  ```

- **GM table use + dice**
  ```
  Roll once on the "Derelict: Complication" table. Use TOOL rollDice / lookup
  and then narrate the outcome.
  ```

> For **exact rules answers** use `temperature: 0.2–0.3`. For **narration**, use `0.7–0.9`.

---

## 7) Content & licensing

- Index only content you’re allowed to use (homebrew, open content, or licensed for machine reading).
- Keep raw text server‑side; never ship full rules into the client bundle.
- Consider a “KB installer” step for users to add their own materials locally.

---

## 8) Tuning & performance

- Keep the model **warm**: `--keepalive` or API `keep_alive` option.
- Retrieval: chunk 800–1200 chars, 10–20% overlap; `topK=6` usually suffices.
- Raise `num_ctx` in the Modelfile for longer scenes (watch VRAM).  
- Add a hidden “self‑check” at the end of the assistant turn: *“List 2–3 rules you applied and cite [n].”*

---

## 9) Session memory (optional but powerful)

After each assistant turn, ask the model (hidden) to emit compact JSON facts to “remember” (NPCs, current goals, unresolved hooks). Append those to session context on later turns and also write to a small `session-mem.json` — keeps continuity over long games.

---

## 10) Quick Checklist

- [ ] `Modelfile` → `mothership-gm` built and running.
- [ ] Qdrant container started (`localhost:6333`).
- [ ] KB converted to `.md/.txt`, ingested via `scripts/ingest.ts`.
- [ ] Retrieval helper wired (`retrieve()` + `formatContext()`).
- [ ] Chat API (`/api/gm`) streams + handles **TOOL** protocol.
- [ ] Tools call your **RANDSUM** dice roller and GM tables.
- [ ] Front‑end hook renders messages and sends prompts.
- [ ] Temperature profiles: low for rules, high for narrative.
- [ ] (Optional) Session memory JSON.

---

## 11) Example GM Tables JSON (optional quick start)

```json
// data/tables/panic.json
{
  "name": "panic",
  "entries": [
    {"min": 2, "max": 7,  "result": "Keep it together."},
    {"min": 8, "max": 10, "result": "Tremble: -2 to checks for 1d10 minutes."},
    {"min": 11,"max": 13, "result": "Drop item; lose next action."},
    {"min": 14,"max": 16, "result": "Scream; attract unwanted attention."},
    {"min": 17,"max": 19, "result": "Berserk; attack nearest creature."},
    {"min": 20,"max": 20, "result": "Catatonia; become unresponsive."}
  ]
}
```

Tool handler can read this file and return the matched entry for a rolled value.

---

### Final Notes

- Keep the **TOOL** protocol strict (one JSON line) so it’s easy to parse.
- The model **never** fabricates dice results; only narrates after the tool returns.
- Iterate on the **SYSTEM** block for your exact table names and house rules.
