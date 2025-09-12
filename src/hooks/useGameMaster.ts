import { useCallback, useRef, useState } from 'react';
import { parseAndRoll } from '@/utils/dice';
import { useInteraction } from '@/context/InteractionContext';

export type Msg = { role: 'user' | 'assistant'; content: string };

type ToolCall =
  | { tool: 'rollDice'; expr: string; reason?: string }
  | { tool: 'requestCheck'; type: 'stat' | 'save'; name: string; advantage?: 'plus' | 'minus' | null }
  | { tool: 'lookup'; table: string; key?: string };

type PendingTool =
  | { kind: 'requestCheck'; call: Extract<ToolCall, { tool: 'requestCheck' }>; prompt: string }
  | null;

function envModel(): string {
  const v = (import.meta as any).env?.VITE_OLLAMA_MODEL as string | undefined;
  return v || 'mothership-gm';
}

async function ragQuery(query: string): Promise<{ context: string; cites: string }> {
  try {
    const res = await fetch('/rag/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, k: 6 }),
    });
    if (!res.ok) throw new Error(`RAG query failed: ${res.status}`);
    const j = await res.json();
    const snippets: any[] = j.snippets || [];
    const cites: string = j.cites || '';
    if (!snippets.length) return { context: '', cites };
    const body = snippets
      .map((s, i) => `[#${i + 1}] ${s?.meta?.source_document || s?.meta?.source || 'KB'}\n${s.text}`)
      .join('\n\n---\n\n');
    return { context: body, cites };
  } catch (e) {
    return { context: '', cites: '' };
  }
}

export function useGameMaster() {
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTool, setPendingTool] = useState<PendingTool>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { requestDiceRoll } = useInteraction();

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const continueWithToolResult = useCallback(async (messages: any[], toolResult: object) => {
    const res = await fetch('/ollama/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: envModel(), messages: [...messages, { role: 'assistant', content: `TOOL RESULT: ${JSON.stringify(toolResult)}` }], stream: false }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama continue failed: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`);
    }
    const j = await res.json();
    const content = j?.message?.content || j?.response || '';
    setHistory(h => [...h, { role: 'assistant', content }]);
  }, []);

  const ask = useCallback(async (prompt: string) => {
    setError(null);
    setPendingTool(null);
    setHistory(h => [...h, { role: 'user', content: prompt }]);

    const { context, cites } = await ragQuery(prompt);
    const sys = context
      ? `CONTEXT (from KB; cite with [n]):\n${context}\n\nCITATIONS: ${cites}\n\nFollow TOOL CALL protocol if dice/lookup needed.`
      : `No external CONTEXT provided. Follow TOOL CALL protocol if dice/lookup needed.`;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setStreaming(true);

    try {
      const res = await fetch('/ollama/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: envModel(),
          messages: [{ role: 'system', content: sys }, ...history, { role: 'user', content: prompt }],
          stream: true,
          options: { temperature: 0.7 },
        }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        throw new Error(`Ollama chat failed: ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`);
      }
      const reader = (res.body as ReadableStream<Uint8Array>).getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let assistant = '';
      let toolCall: ToolCall | null = null;

      // Push a placeholder assistant message for streaming UI
      setHistory(h => [...h, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t) continue;
          let ev: any;
          try { ev = JSON.parse(t); } catch { continue; }
          const piece: string = ev?.message?.content || '';
          if (piece) {
            assistant += piece;
            // Detect TOOL line only when a full line arrives in piece
            // If assistant contains a full line starting with TOOL:, try to parse JSON
            const lastNewline = assistant.lastIndexOf('\n');
            const inspect = lastNewline >= 0 ? assistant.slice(0, lastNewline) : assistant;
            const linesA = inspect.split('\n');
            const lastLine = linesA[linesA.length - 1].trim();
            const m = lastLine.match(/^TOOL:\s*(\{[\s\S]*\})\s*$/);
            if (m) {
              try {
                toolCall = JSON.parse(m[1]);
              } catch {}
            }
            // Update the last assistant message content (always the most recent)
            setHistory(h => {
              const cp = h.slice();
              const last = cp.length - 1;
              if (last >= 0 && cp[last].role === 'assistant') {
                cp[last] = { role: 'assistant', content: assistant };
              } else {
                cp.push({ role: 'assistant', content: assistant });
              }
              return cp;
            });
          }
        }
        if (toolCall) break; // stop streaming to handle tool
      }

      setStreaming(false);

      if (toolCall) {
        // Build messages used so far (system + prior messages + latest user + streamed assistant so far)
        const messages = [{ role: 'system', content: sys }, ...history, { role: 'user', content: prompt }, { role: 'assistant', content: assistant }];
        // Handle tools
        if (toolCall.tool === 'rollDice') {
          const res = parseAndRoll(toolCall.expr);
          const toolResult = { expr: toolCall.expr, rolls: res.rolls, total: res.total, reason: toolCall.reason || '' };
          await continueWithToolResult(messages, toolResult);
          return;
        }
        if (toolCall.tool === 'lookup') {
          const q = [toolCall.table, toolCall.key].filter(Boolean).join(' ');
          const rag = await ragQuery(q);
          const toolResult = { table: toolCall.table, key: toolCall.key || '', result: rag.context ? rag.context.split('\n---\n')[0] : '' };
          await continueWithToolResult(messages, toolResult);
          return;
        }
        if (toolCall.tool === 'requestCheck') {
          // Open dice roller to assist the user
          requestDiceRoll({ type: toolCall.type, name: toolCall.name });
          setPendingTool({ kind: 'requestCheck', call: toolCall, prompt });
          // Store messages reference for later continuation in a closure
          (continueWithToolResult as any).lastMessages = messages;
          return;
        }
      }
    } catch (e: any) {
      // Fallback to non-streaming request for environments where fetch streams are unreliable
      try {
        const res2 = await fetch('/ollama/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            model: envModel(),
            messages: [{ role: 'system', content: sys }, ...history, { role: 'user', content: prompt }],
            stream: false,
            options: { temperature: 0.7 },
          }),
        });
        if (!res2.ok) {
          const text = await res2.text().catch(() => '');
          throw new Error(`Ollama chat (fallback) failed: ${res2.status} ${res2.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`);
        }
        const j2 = await res2.json();
        const content2 = j2?.message?.content || j2?.response || '';
        setHistory(h => [...h, { role: 'assistant', content: content2 || '[No content returned]' }]);
      } catch (e2: any) {
        setError(e2?.message || e?.message || 'Failed to contact GM model');
      } finally {
        setStreaming(false);
      }
    }
  }, [history, continueWithToolResult, requestDiceRoll]);

  const submitPendingTool = useCallback(async (result: { roll: number; target?: number }) => {
    if (!pendingTool) return;
    const toolResult = {
      type: pendingTool.call.type,
      name: pendingTool.call.name,
      advantage: pendingTool.call.advantage ?? null,
      roll: result.roll,
      target: result.target ?? null,
      success: typeof result.target === 'number' ? result.roll <= result.target : undefined,
    };
    const messages = (continueWithToolResult as any).lastMessages as any[];
    setPendingTool(null);
    await continueWithToolResult(messages, toolResult);
  }, [pendingTool, continueWithToolResult]);

  return { history, ask, stop, streaming, error, pendingTool, submitPendingTool };
}
