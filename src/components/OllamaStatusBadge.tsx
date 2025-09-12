import React, { useEffect, useState, useCallback } from 'react';
import { checkOllamaHealth } from '@/services/geminiService';

type Status = 'checking' | 'ok' | 'model-missing' | 'offline' | 'error';

export const OllamaStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState<string>('');
  const [base, setBase] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    setStatus('checking');
    setMessage('');
    const res = await checkOllamaHealth({ ensureModel: true }).catch(err => ({ ok: false, message: err?.message }));
    if (!res.ok) {
      setStatus('offline');
      setMessage(res.message || 'Not reachable');
      setBase(res.base);
      return;
    }
    if (res.modelPresent === false) {
      setStatus('model-missing');
      setMessage('Model not installed');
      setBase(res.base);
      return;
    }
    setStatus('ok');
    setBase(res.base);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20000);
    return () => clearInterval(id);
  }, [refresh]);

  const styles: Record<Status, string> = {
    checking: 'text-muted border-muted',
    ok: 'text-positive border-positive/60',
    'model-missing': 'text-warning border-warning/60',
    offline: 'text-danger border-danger/60',
    error: 'text-danger border-danger/60',
  };

  const label: Record<Status, string> = {
    checking: 'Ollama: Checking…',
    ok: 'Ollama: Connected',
    'model-missing': 'Ollama: Model Missing',
    offline: 'Ollama: Offline',
    error: 'Ollama: Error',
  };

  return (
    <button
      onClick={refresh}
      title={`${label[status]}${base ? ` (${base})` : ''}${message ? ` — ${message}` : ''}`}
      className={`ml-2 px-2 py-1 text-xs uppercase tracking-wider border ${styles[status]} bg-black/30 hover:bg-black/50`}
    >
      {label[status]}
    </button>
  );
};
