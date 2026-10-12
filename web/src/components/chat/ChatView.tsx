import { useEffect, useRef } from 'react';
import { useChatStore } from '../../lib/store';
import { MessageBubble } from './MessageBubble';

export function ChatView() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4 opacity-30">&#x2666;</div>
            <h2 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-400">
              Hermeneut Agent
            </h2>
            <p className="text-sm">
              输入文本或上传文件，开始话语分析。
              <br />
              支持单视角分析、辩证分析和结构化访谈。
            </p>
          </div>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
