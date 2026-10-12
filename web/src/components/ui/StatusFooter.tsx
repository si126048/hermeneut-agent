import { useEffect, useState } from 'react';
import { health } from '../../lib/api';
import { useChatStore } from '../../lib/store';

export function StatusFooter() {
  const [healthy, setHealthy] = useState(false);
  const { messages, clearMessages, setSidebarOpen, sidebarOpen } = useChatStore();

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

  return (
    <footer className="h-7 flex items-center justify-between px-4 border-t border-border dark:border-border-dark bg-white dark:bg-surface-dark text-xs text-gray-400">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              healthy ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          SYS
        </span>
        <span>v2.2.0</span>
        <span>LOCAL</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{messages.length} messages</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hover:text-gray-600"
        >
          {sidebarOpen ? '\u25C0' : '\u25B6'}
        </button>
        <button
          onClick={clearMessages}
          className="hover:text-red-500"
        >
          Clear
        </button>
      </div>
    </footer>
  );
}
