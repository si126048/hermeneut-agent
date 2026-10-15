import { type AnalysisCard as CardType } from '../../lib/store';

const registerColors: Record<string, string> = {
  S: 'border-l-symbolic',
  I: 'border-l-imaginary',
  R: 'border-l-real',
};

const variantLabels: Record<string, string> = {
  observation: 'OBS',
  hypothesis: 'HYP',
  counterexample: 'CC',
  synthesis: 'SYN',
  report: 'RPT',
};

const variantStyles: Record<string, string> = {
  observation: 'bg-surface-2/60 dark:bg-surface-2-dark/60',
  hypothesis: 'bg-amber-50/40 dark:bg-amber-900/10',
  counterexample: 'bg-orange-50/40 dark:bg-orange-900/10',
  synthesis: 'bg-blue-50/40 dark:bg-blue-900/10',
  report: 'bg-surface-2/60 dark:bg-surface-2-dark/60',
};

interface Props {
  card: CardType;
}

export function AnalysisCardComponent({ card }: Props) {
  const borderColor = card.register ? registerColors[card.register] || '' : '';
  const variantLabel = variantLabels[card.variant] || card.variant.toUpperCase();
  const bgStyle = variantStyles[card.variant] || '';
  const mono = { fontFamily: 'var(--font-mono)' };

  return (
    <div
      className={`border-l-[3px] ${borderColor} ${bgStyle} px-3 py-2 text-sm`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-semibold text-muted tracking-wider"
          style={mono}
        >
          {variantLabel}
        </span>
        {card.tag && (
          <span className="text-[10px] text-muted/60" style={mono}>{card.tag}</span>
        )}
        {card.register && (
          <span
            className={`text-[10px] px-1.5 py-0.5 border ${
              card.register === 'S'
                ? 'border-symbolic/30 text-symbolic bg-symbolic/5'
                : card.register === 'I'
                ? 'border-imaginary/30 text-imaginary bg-imaginary/5'
                : 'border-real/30 text-real bg-real/5'
            }`}
            style={mono}
          >
            {card.register}
          </span>
        )}
      </div>
      <p className="text-ink-soft dark:text-ink-soft-dark leading-relaxed text-[13px]">
        {card.content}
      </p>
      {card.meta && Object.keys(card.meta).length > 0 && (
        <div className="mt-1.5 flex gap-2 flex-wrap">
          {Object.entries(card.meta).map(([k, v]) => (
            <span
              key={k}
              className="text-[10px] text-muted/60"
              style={mono}
            >
              {k}: {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { AnalysisCardComponent as AnalysisCard };
