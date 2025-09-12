# Mothership AI GM Integration (Chroma RAG) — Proposal and Plan

This document consolidates the agreed direction and provides a concrete, step‑by‑step plan to integrate a multifunctional AI Game Master (GM) into the app using:

- A dockable GM Chat with a strict Tool protocol for dice/checks/lookups
- A Retrieval‑Augmented Generation (RAG) service backed by ChromaDB
- Optional later persona fine‑tuning (QLoRA) to improve style and flow

The plan prioritizes immediate utility while keeping the system extensible and legally safe (no proprietary content shipped in the client).

---

## Goals

- Narrate scenes, answer rules questions, adjudicate outcomes, and react to dice rolls.
- Keep dice authority with the player: the model requests checks; the UI performs rolls.
- Ground rules/tables/lore with local RAG; keep copyrighted sources out of the client.
- Start simple (client‑orchestrated chat + tools), add RAG, then consider SFT.

---

## Current Codebase Summary (relevant parts)

- Ollama client (one‑shot generation): `src/services/geminiService.ts:17`
- Health/model badge: `src/components/OllamaStatusBadge.tsx:1`
- Vite dev proxy for Ollama: `vite.config.ts:1`
- Dice engine + helpers: `src/utils/dice.ts:1`
- Dice UI + flow: `src/components/dice-roller/*`, `src/components/FloatingDiceRoller.tsx:1`
- App panels/state for interop: `src/context/InteractionContext.tsx:1`, `src/context/PanelsContext.tsx:1`

The app is SPA‑only today (no backend) and has no chat or RAG.

---

## Chosen Strategy

- Adopt ChromaDB for RAG (Python service), proxied from the web app.
- Keep tool‑calling and streaming glue in the app (as is) for GM chat.
- Add a Python RAG path that can do both retrieval and optional QA synthesis via LangChain (Node or client can call it).
- Later, introduce a thin Node gateway only if needed to mediate auth/routing.

---

## Tool Call Protocol (v1)

The GM must never roll dice directly; instead it emits a single JSON object on a line starting with `TOOL:` and then waits for a result.

- `rollDice`: `{ "tool": "rollDice", "expr": "2d10+5", "reason?": string }`
  - App rolls locally via `src/utils/dice.ts` and returns: `{ expr, rolls, total, reason }`.

- `requestCheck`: `{ "tool": "requestCheck", "type": "stat"|"save", "name": string, "advantage?": "plus"|"minus"|null }`
  - App opens the Dice Roller (via `useInteraction().requestDiceRoll`) and returns: `{ type, name, target, roll, success, advantage }`.

- `lookup`: `{ "tool": "lookup", "table": string, "key?": string }`
  - v1: query in‑app constants (e.g., Panic/Wound stubs) and return a text/result blob. v2: delegate to RAG with filters.

The continuation message to the model is: `TOOL RESULT: { ...json... }`.

---

## Alignment With Your 7 Directives

1) Add a Python RAG path
- Keep the current app stack. Add `rag_service/` (FastAPI) that handles: ingest (LangChain), retrieval (Chroma), and optional QA synthesis (LangChain+Ollama).
- Expose HTTP endpoints; call them from the app via a Vite proxy (or a small Node gateway later).

2) Re‑index with smaller chunks + metadata
- Use 250–500 char chunks with ~50 overlap.
- Enrich metadata: `source_document`, `source_page`, `section`, `keywords` to enable filtering and precise citations.

3) Embeddings model
- Default to `sentence-transformers` `all-MiniLM-L6-v2` for Chroma (good quality; fast; local).
- Optionally benchmark against Ollama embeddings (`/api/embed`) on a held‑out query set (compare P@k/MRR) before locking choice.

4) Prompting: adopt Llama 3.1 template
- Update Modelfile to include a Llama‑3.1‑style TEMPLATE and stop tokens; keep TOOL protocol in SYSTEM.
- Keep chat formatting consistent with roles; ensure streaming uses the same message template.

5) Phase II — SFT for persona
- Follow QLoRA to style‑tune for Mothership tone and procedures; keep the dataset curated and compact.
- Merge LoRA; convert to GGUF; create an Ollama model; drop‑in replace in the same RAG path.

6) Adopt the evaluation rubric
- Evaluate each test session on five axes: Rules Accuracy, Coherence, Tone Fidelity, Reactivity (to dice/tools), Groundedness/Citations.
- Log transcripts with ratings + notes; iterate Modelfile, dataset, and retriever filters accordingly.

7) Legal hygiene
- Treat KB as user‑provided; store locally; never ship copyrighted texts in builds.
- Add a README warning and a small in‑app tip near RAG features.

---

## Phased Roadmap

1) GM Chat + Tools (client‑first)
- Add a dockable “GM Chat” panel and a `useGameMaster` hook to stream `/api/chat` from Ollama, parse TOOL calls, fulfill them, then continue with `TOOL RESULT`.
- Ship a Modelfile persona ("mothership-gm") with TOOL protocol and output style.

2) RAG with Chroma (Python service)
- Build a local corpus and Chroma index; create a small FastAPI service to expose retrieval.
- Expose both retrieval (`/rag/query`) and optional QA synthesis (`/rag/qa`) using LangChain+Ollama.
- Include citations in the system message supplied to the model (if using retrieval‑only mode).

3) Persona SFT (optional, external)
- QLoRA style‑tune a copy of Llama 3.1‑Instruct for Mothership tone and GM procedures.
- Swap in the tuned model locally in Ollama when ready.

4) Tool/UX Enrichment
- Add table‑specific tools (panicEffect, woundEffect, tableRoll("trinkets"), etc.).
- Improve citation rendering and session summary memory.

---

## Chroma RAG — Architecture Overview

- Corpus lives locally on disk: `mothership_corpus/` for cleaned text; optional `mothership_tables/` JSON/CSV.
- Index: Chroma persisted collection (e.g., `./vector_store/chroma`), embeddings via `sentence-transformers` (`all-MiniLM-L6-v2`).
- Service: Python FastAPI exposing `/health`, `/index/build`, `/rag/query` (retrieval‑only) and `/rag/qa` (retrieval + LLM synthesis via LangChain).
- Frontend: on each GM turn, retrieve top‑K snippets, inject into a system message `CONTEXT: …` with citations, then call Ollama chat.

---

## Step‑by‑Step Plan (Chroma approach)

1) Prepare the corpus (local only)
- Create `mothership_corpus/` and add cleaned `.md/.txt` extracts of books/modules, and structured tables as `.json/.csv` where needed.
- Ensure no copyrighted content is bundled into the client build; keep it outside `src/`.

2) Create a Python RAG service (FastAPI)
- New folder: `rag_service/` with `app.py`, `indexer.py`, `rag.py`, `config.py`, `requirements.txt`.
- Dependencies (requirements.txt): `fastapi`, `uvicorn[standard]`, `chromadb`, `langchain`, `langchain-community`, `sentence-transformers`, `pypdf`, `python-dotenv`.
- Config: base paths, collection name, chunking (size=500, overlap=50), embedding model `all-MiniLM-L6-v2`.

3) Implement indexing (`indexer.py`)
- Load files from `mothership_corpus/` (use PyPDF/Text loaders as applicable).
- Split with `RecursiveCharacterTextSplitter` (500/50) and enrich metadata: `source_document`, `source_page`, `section`, `keywords`.
- Build/persist Chroma collection at `./vector_store/chroma` using `SentenceTransformerEmbeddings`.
- Expose `POST /index/build` to rebuild index on demand.

4) Implement retrieval (`rag.py`)
- Open the persisted Chroma collection with the same embedding model.
- Expose `POST /rag/query` accepting `{ query: string, k?: number, filters?: object }`.
- Return `{ snippets: Array<{ text, score?, meta }>, cites: string }` where `meta` mirrors source/page/section.

5) Service shell (`app.py`)
- `GET /health` returns model/index readiness.
- Wire `POST /index/build` and `POST /rag/query` routes.
- Run with `uvicorn` (e.g., `uvicorn app:app --reload --port 8790`).

6) Dev proxy in Vite (frontend)
- Add a dev proxy for the Python service, e.g.: `/rag` → `http://localhost:8790`.

7) Client GM flow (`src/hooks/useGameMaster.ts`)
- Add a hook that:
  - Calls `/rag/query` with the user’s input to get `snippets` and `cites`.
  - Builds a system message: `CONTEXT (from KB; cite with [n]):\n...\nCITATIONS: ...\nFollow TOOL CALL protocol…`.
  - Calls Ollama chat (streaming), accumulates tokens, detects lines beginning with `TOOL:`.
  - On tool call:
    - `rollDice`: evaluate with `src/utils/dice.ts` and append an assistant message: `TOOL RESULT: {...}` then continue chat.
    - `requestCheck`: call `useInteraction().requestDiceRoll`, wait for the user to roll, then continue with `TOOL RESULT`.
    - `lookup`: if `table` is supported in‑app constants, return that; otherwise do a targeted `/rag/query` and return a best match.

8) GM Chat panel (`src/components/FloatingGMChat.tsx`)
- Dockable panel rendering the chat history, input box, and streaming output (reuse animated typing from `AILogDisplay` where appropriate).
- Add a header button to open the panel; register `gm-chat` in `PanelsContext`.

9) Modelfile persona (repo root)
- Create `Modelfile` named model `mothership-gm`:
  - Persona: Mothership Warden; never roll dice; wait for TOOL results; cite as `[n]` when context is present.
  - TEMPLATE: adopt Llama‑3.1 message format for system/user/assistant and include stop tokens for role boundaries.
  - Parameters: `temperature 0.6–0.8`, `top_p 0.9`, `num_ctx 8192`.
  - Keep TOOL protocol text short, unambiguous, and compatible with the TEMPLATE flow.
  - Build: `ollama create mothership-gm -f Modelfile`.

10) Testing and validation
- Smoke tests: `/health`, index build, basic `/rag/query` against known phrases.
- End‑to‑end: Ask rules questions with citations; request a check; verify the dice roller handoff.

11) Hardening (later)
- Add filtered retrieval by `section`/`source_document`.
- Implement session memory summaries client‑side; push to server later if needed.
- Add table‑specific tools (`panicEffect`, `woundEffect`, `tableRoll`) with structured outputs.

---

## File/Module Mapping (planned)

- Frontend (TypeScript):
  - `src/hooks/useGameMaster.ts` — chat + tool orchestration
  - `src/components/FloatingGMChat.tsx` — dockable chat UI
  - `src/context/PanelsContext.tsx` — add `gm-chat` panel ID
  - `vite.config.ts` — dev proxy for `/rag`

- Python RAG Service:
  - `rag_service/requirements.txt`
  - `rag_service/config.py`
  - `rag_service/indexer.py`
  - `rag_service/rag.py`
  - `rag_service/app.py`

- Data & Index (local, not shipped):
  - `mothership_corpus/` — cleaned text + structured tables
  - `vector_store/chroma/` — persisted Chroma collection

---

## Open Decisions & Notes

- Start with client‑orchestrated tools to leverage existing dice UI; consider moving orchestration server‑side later.
- Keep all copyrighted sources and the vector store out of the client bundle.
- Consider Chroma server mode or keep embedded; the plan above uses embedded persistent mode for simplicity.
- SFT (QLoRA) is optional and should live in a separate training workspace.

---

## Llama 3.1 TEMPLATE (Modelfile) — Guidance

- Define a TEMPLATE that formats messages with explicit role sections (system, user, assistant) consistent with Llama‑3.1 expectations.
- Add `STOP` parameters for role delimiters (e.g., `</s>` or template‑specific markers) so the model doesn’t drift across roles.
- Keep the SYSTEM short and authoritative; include:
  - Identity: “You are the Mothership Game Master (Warden).”
  - Rules: “Never roll dice; always issue TOOL: {...} and wait for TOOL RESULT.”
  - Citations: “When CONTEXT is present, cite as [n].”
  - Style: brief, vivid, second‑person, compact mechanics blocks.

---

## Embeddings Benchmark (MiniLM vs Ollama Embeds)

- Build a small query set (10–20 realistic rules prompts) with expected source pages.
- For each approach (MiniLM vs Ollama `/api/embed`), compute:
  - Precision@k (k=3/5), MRR.
  - Qualitatively judge snippet readability and overlap.
- Choose MiniLM unless Ollama embeds outperform on both metrics.

---

## Phase II — SFT (QLoRA) Quick Plan

1) Curate a high‑quality JSONL dataset of message transcripts covering:
   - Rules adjudication, narrative style, GM procedures, table usage, dice handoffs.
2) Train LoRA adapters with QLoRA on Llama 3.1‑Instruct.
3) Merge LoRA; export to GGUF.
4) Create an Ollama model (Modelfile `FROM` the GGUF) and test locally.
5) Swap the model into the RAG pipeline and re‑evaluate with the rubric.

---

## Evaluation Rubric (per session)

- Rules Accuracy: correct mechanics, targets, and procedures.
- Coherence: logical flow, avoids contradictions.
- Tone Fidelity: gritty, tense, Mothership‑appropriate voice.
- Reactivity: correct handling of TOOL calls, dice results, and user choices.
- Groundedness: uses CONTEXT; cites `[n]`; avoids hallucinations when context is missing.

Record a score 1–5 and notes for each axis; keep transcript logs for iteration.

---

## Legal Hygiene

- The KB is user‑provided and stored locally; do not ship or commit proprietary texts.
- Add a “Legal” section to README and a brief UX notice in RAG/GM Chat that content must be sourced from owned materials for personal use.
