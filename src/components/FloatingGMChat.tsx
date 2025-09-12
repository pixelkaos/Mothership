import React, { useMemo, useState } from 'react';
import { DockablePanel } from '@/components/DockablePanel';
import { useGameMaster } from '@/hooks/useGameMaster';

export const FloatingGMChat: React.FC = () => {
  const { history, ask, streaming, error, pendingTool, submitPendingTool } = useGameMaster();
  const [input, setInput] = useState('');

  const canSend = useMemo(() => input.trim().length > 0 && !streaming && !pendingTool, [input, streaming, pendingTool]);

  return (
    <DockablePanel title="GM Chat" id="gm-chat" className="w-full max-w-xl">
      <div className="flex flex-col h-[420px]">
        <div className="flex-1 overflow-y-auto p-space-3 space-y-space-3">
          {history.length === 0 && !streaming && (
            <p className="text-muted text-sm">Ask the Warden about rules, scenes, or outcomes. The GM will request dice via tools and wait for your result.</p>
          )}
          {history.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-foreground' : 'text-primary'}>
              <div className="text-xs uppercase tracking-wider opacity-70">{m.role}</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {streaming && <div className="text-primary text-sm animate-pulse">GM is typing…</div>}
          {error && <div className="text-danger text-sm">{error}</div>}
          {pendingTool?.kind === 'requestCheck' && (
            <div className="border border-primary/50 p-space-3 bg-black/40">
              <div className="font-semibold text-primary mb-space-2">Requested Check</div>
              <div className="text-sm text-foreground mb-space-3">
                The GM requested a {pendingTool.call.type} check: <strong>{pendingTool.call.name}</strong>{pendingTool.call.advantage ? ` (${pendingTool.call.advantage})` : ''}. Opened Dice Roller. Enter your roll (and target if known), then submit to continue.
              </div>
              <RequestCheckForm onSubmit={submitPendingTool} />
            </div>
          )}
        </div>
        <form
          className="border-t border-primary/50 p-space-2 flex items-center gap-space-2"
          onSubmit={e => { e.preventDefault(); if (canSend) { const p = input; setInput(''); ask(p); } }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 bg-black/40 border border-primary/40 px-space-2 py-space-2 text-foreground"
          />
          <button type="submit" disabled={!canSend} className="px-space-3 py-space-2 bg-primary/80 text-black disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </DockablePanel>
  );
};

const RequestCheckForm: React.FC<{ onSubmit: (v: { roll: number; target?: number }) => void }> = ({ onSubmit }) => {
  const [roll, setRoll] = useState('');
  const [target, setTarget] = useState('');
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="flex items-end gap-space-2"
      onSubmit={e => {
        e.preventDefault();
        const r = parseInt(roll, 10);
        if (!Number.isFinite(r)) { setErr('Enter a valid roll'); return; }
        const t = target.trim() ? parseInt(target, 10) : undefined;
        if (t !== undefined && !Number.isFinite(t)) { setErr('Invalid target'); return; }
        setErr(null);
        onSubmit({ roll: r, target: t });
      }}
    >
      <div className="flex flex-col">
        <label className="text-xs text-muted">Roll (d100)</label>
        <input value={roll} onChange={e => setRoll(e.target.value)} className="w-24 bg-black/40 border border-primary/40 px-space-2 py-space-1" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-muted">Target (optional)</label>
        <input value={target} onChange={e => setTarget(e.target.value)} className="w-24 bg-black/40 border border-primary/40 px-space-2 py-space-1" />
      </div>
      <button type="submit" className="px-space-3 py-space-2 bg-primary/80 text-black">Submit</button>
      {err && <div className="text-danger text-xs ml-space-2">{err}</div>}
    </form>
  );
};

