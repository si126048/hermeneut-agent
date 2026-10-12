import { useEffect } from 'react';
import { useChatStore } from './lib/store';
import { ChatView } from './components/chat/ChatView';
import { ChatInput } from './components/chat/ChatInput';
import { Sidebar } from './components/sidebar/Sidebar';
import { StatusFooter } from './components/ui/StatusFooter';

export default function App() {
  const { sidebarOpen, loadMessages } = useChatStore();

  useEffect(() => { loadMessages(); }, []);

  return (
    <div className="h-screen flex flex-col bg-surface dark:bg-surface-dark">
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatView />
          <ChatInput />
        </main>
      </div>
      <StatusFooter />
    </div>
  );
}
