import { useEffect } from 'react';
import { useChatStore } from './lib/store';
import { ChatView } from './components/chat/ChatView';
import { ChatInput } from './components/chat/ChatInput';
import { Sidebar } from './components/sidebar/Sidebar';
import { StatusFooter } from './components/ui/StatusFooter';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { StartupAnimation } from './components/startup/StartupAnimation';

export default function App() {
  const { sidebarOpen, setSidebarOpen, loadMessages, startupCompleted, setStartupCompleted } = useChatStore();

  useEffect(() => { loadMessages(); }, []);

  if (!startupCompleted) {
    return (
      <ErrorBoundary>
        <StartupAnimation onComplete={() => setStartupCompleted(true)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-surface dark:bg-surface-dark relative overflow-hidden">
        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-50"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.6'/></svg>")`,
          }}
        />
        {/* 暗角 */}
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%)',
          }}
        />

        {/* 抽屉式侧边栏（自身管理显隐） */}
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex flex-1 overflow-hidden relative z-10">
          <main className="flex-1 flex flex-col min-w-0">
            {/* 顶部工具条 */}
            <div className="flex items-center h-10 px-1 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 flex items-center justify-center text-muted hover:text-ink dark:hover:text-ink-dark transition-colors shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {sidebarOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                  }
                </svg>
              </button>
            </div>
            <ChatView />
            <ChatInput />
          </main>
        </div>
        <StatusFooter />
      </div>
    </ErrorBoundary>
  );
}
