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
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-ink text-ink-dark border-l-[3px] border-accent'
            : 'bg-surface-2 dark:bg-surface-2-dark border border-border dark:border-border-dark'
        }`}
      >
        {message.content && (
          <div className={isUser ? '' : 'text-ink dark:text-ink-dark'}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}
        {message.streaming && !message.content && (
          <span className="inline-block w-1.5 h-4 bg-accent animate-pulse" />
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
                className="text-xs px-2 py-0.5 border border-border dark:border-border-dark"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
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
