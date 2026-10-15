import { useEffect, useState } from 'react';
import { chatPersona, createPersona, ensureParticipant, ensureProject, listPersonas, trainPersona } from '../../lib/api';
import type { Persona } from '../../lib/api';

export function TopoStylePanel() {
  const projectId = 'default';
  const participantId = 'local-user';
  const [name, setName] = useState('我的风格');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selected, setSelected] = useState<Persona | null>(null);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    listPersonas(projectId, participantId)
      .then((r) => setPersonas(r.personas))
      .catch((e) => { console.warn('Failed to load personas:', e); setPersonas([]); });
  };

  useEffect(() => { refresh(); }, [projectId, participantId]);

  const create = async () => {
    setError(null);
    try {
      await ensureProject(projectId);
      await ensureParticipant(participantId, projectId);
      const p = await createPersona({ project_id: projectId, participant_id: participantId, name });
      setPersonas((xs) => [...xs, p]);
      setSelected(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : '创建失败');
    }
  };

  const train = async () => {
    if (!selected) return;
    setError(null);
    setBusy(true);
    try {
      await trainPersona(selected.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '训练失败');
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!selected || !prompt.trim()) return;
    setError(null);
    setBusy(true);
    setAnswer('');
    try {
      await chatPersona(selected.id, { prompt }, (event, data) => {
        if (event === 'text' && typeof data === 'object' && data !== null && 'chunk' in data) {
          const chunk = (data as { chunk: string }).chunk;
          if (typeof chunk === 'string') {
            setAnswer((x) => x + chunk);
          }
        }
      });
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '对话失败');
    } finally {
      setBusy(false);
    }
  };

  const mono = { fontFamily: 'var(--font-mono)' };
  const inputCls = 'w-full bg-transparent border-0 border-b border-border dark:border-border-dark px-0 py-1.5 text-sm text-ink dark:text-ink-dark placeholder-muted outline-none focus:border-accent transition-colors';
  const btnCls = 'px-3 py-1 text-xs border border-ink dark:border-ink-dark bg-transparent text-ink dark:text-ink-dark hover:bg-ink hover:text-ink-dark transition-colors';

  return (
    <section className="p-4 border-b border-border dark:border-border-dark space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink dark:text-ink-dark tracking-tight" style={{ fontFamily: 'var(--font-din)' }}>TopoStyle Persona</h2>
        <span className="text-[10px] text-muted tracking-wider" style={mono}>AI</span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted" style={mono}>
        <span>PROJECT: {projectId}</span>
        <span className="opacity-40">|</span>
        <span>PARTICIPANT: {participantId}</span>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[10px] text-muted tracking-wider block mb-1" style={mono}>NAME</label>
          <input className={inputCls} value={name}
            onChange={(e) => setName(e.target.value)} placeholder="Persona 名称" />
        </div>
        <button className={btnCls} onClick={create}>CREATE</button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {personas.map((p) => (
          <button key={p.id} onClick={() => setSelected(p)}
            className={`px-2 py-0.5 text-[10px] border transition-colors ${
              selected?.id === p.id
                ? 'border-accent text-accent bg-accent/5'
                : 'border-border dark:border-border-dark text-muted hover:text-ink dark:hover:text-ink-dark hover:border-ink dark:hover:border-ink-dark'
            }`}
            style={mono}
          >
            {p.name} · {p.status}
          </button>
        ))}
      </div>

      {error && <div className="text-xs text-glitch-a">{error}</div>}

      {selected && (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm flex-1 text-ink dark:text-ink-dark" style={{ fontFamily: 'var(--font-din)' }}>{selected.name}</span>
            <button disabled={busy} className="text-[10px] text-muted hover:text-accent underline" style={mono} onClick={train}>
              {busy ? 'PROCESSING...' : 'TRAIN'}
            </button>
          </div>
          <textarea
            className="w-full bg-transparent border border-border dark:border-border-dark p-2 text-sm text-ink dark:text-ink-dark placeholder-muted outline-none focus:border-accent transition-colors"
            style={mono}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入 Persona 对话..."
            rows={3}
          />
          <button disabled={busy} className={btnCls} onClick={send}>SEND</button>
          {answer && (
            <div className="border-l-2 border-accent/40 pl-3 text-sm text-ink-soft dark:text-ink-soft-dark whitespace-pre-wrap leading-relaxed">
              <span className="text-[10px] text-muted block mb-1" style={mono}>RESPONSE</span>
              {answer}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
