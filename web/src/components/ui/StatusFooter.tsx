import { useEffect, useState } from 'react';
import { health } from '../../lib/api';
import { useChatStore } from '../../lib/store';

export function StatusFooter() {
  const [healthy, setHealthy] = useState(false);
  const { messages, clearMessages } = useChatStore();

  useEffect(() => {
    health()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
    const interval = setInterval(() => {
      health()
        .then(() => setHealthy(true))
        .catch(() => setHealthy(false));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const mono = { fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.06em' };

  return (
    <footer
      className="h-7 flex items-center justify-between px-4 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-muted"
      style={mono}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 ${healthy ? 'bg-accent' : 'bg-glitch-a'}`}
          />
          SYS
        </span>
        <span className="opacity-40">|</span>
        <span>v3.1.0</span>
        <span className="opacity-40">|</span>
        <span>LOCAL</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{messages.length} MSG</span>
        <button
          onClick={clearMessages}
          className="hover:text-accent transition-colors"
        >
          CLR
        </button>
      </div>
    </footer>
  );
}
