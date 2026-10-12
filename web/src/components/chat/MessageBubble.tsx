import { type ChatMessage } from '../../lib/store';
import { AnalysisCard } from './AnalysisCard';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-symbolic text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 border border-border dark:border-border-dark rounded-bl-sm'
        }`}
      >
        {message.content && (
          <div className="text-sm leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}
        {message.streaming && !message.content && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse" />
        )}
        {message.cards && message.cards.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.cards.map((card, i) => (
              <AnalysisCard key={i} card={card} />
            ))}
          </div>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {message.attachments.map((name, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded bg-black/10 dark:bg-white/10"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
