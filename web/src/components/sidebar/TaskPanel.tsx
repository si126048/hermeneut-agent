import { useState } from 'react';
import { useChatStore } from '../../lib/store';

export function TaskPanel() {
  const { tasks, currentTaskId, createTask, switchTask, deleteTask } = useChatStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const mono = { fontFamily: 'var(--font-mono)' };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${mm}-${dd} ${hh}:${mi}`;
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteTask(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted tracking-wider" style={mono}>TASKS / 任务</span>
        <button
          onClick={createTask}
          className="text-[10px] text-muted hover:text-accent transition-colors border border-border dark:border-border-dark px-2 py-0.5 hover:border-accent"
          style={mono}
        >
          + NEW
        </button>
      </div>

      <div className="space-y-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => switchTask(t.id)}
            className={`group flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors ${
              currentTaskId === t.id
                ? 'border-l-2 border-l-accent bg-accent/5'
                : 'border-l-2 border-l-transparent hover:bg-ink/5'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-ink dark:text-ink-dark truncate" style={{ fontFamily: 'var(--font-zh)' }}>
                {t.name}
              </div>
              <div className="text-[10px] text-muted/60 mt-0.5" style={mono}>
                {formatDate(t.createdAt)}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
              className={`text-[10px] transition-colors shrink-0 ${
                confirmDelete === t.id
                  ? 'text-glitch-a border border-glitch-a px-1.5 py-0.5'
                  : 'text-muted/40 hover:text-glitch-a opacity-0 group-hover:opacity-100'
              }`}
              style={mono}
              title={confirmDelete === t.id ? '再次点击确认删除' : '删除任务'}
            >
              {confirmDelete === t.id ? 'SURE?' : '\u00D7'}
            </button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-6">
          <div className="text-3xl mb-3 text-muted/30">&#9993;</div>
          <p className="text-xs text-muted mb-4" style={mono}>NO TASKS / 暂无任务</p>
          <button
            onClick={createTask}
            className="px-4 py-1.5 text-xs border border-ink dark:border-ink-dark bg-transparent text-ink dark:text-ink-dark hover:bg-ink hover:text-ink-dark transition-colors"
            style={mono}
          >
            CREATE / 新建
          </button>
        </div>
      )}
    </div>
  );
}
