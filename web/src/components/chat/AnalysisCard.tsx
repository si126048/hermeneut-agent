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
  observation: 'bg-gray-50 dark:bg-gray-800/50',
  hypothesis: 'bg-amber-50/50 dark:bg-amber-900/10',
  counterexample: 'bg-orange-50/50 dark:bg-orange-900/10',
  synthesis: 'bg-blue-50/50 dark:bg-blue-900/10',
  report: 'bg-gray-50 dark:bg-gray-800/50',
};

interface Props {
  card: CardType;
}

export function AnalysisCardComponent({ card }: Props) {
  const borderColor = card.register ? registerColors[card.register] || '' : '';
  const variantLabel = variantLabels[card.variant] || card.variant.toUpperCase();
  const bgStyle = variantStyles[card.variant] || '';

  return (
    <div
      className={`border-l-3 ${borderColor} ${bgStyle} rounded-r-lg px-3 py-2 text-sm`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
          {variantLabel}
        </span>
        {card.tag && (
          <span className="text-xs font-mono text-gray-400">{card.tag}</span>
        )}
        {card.register && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-mono ${
              card.register === 'S'
                ? 'bg-symbolic/10 text-symbolic'
                : card.register === 'I'
                ? 'bg-imaginary/10 text-imaginary'
                : 'bg-real/10 text-real'
            }`}
          >
            {card.register}
          </span>
        )}
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {card.content}
      </p>
      {card.meta && Object.keys(card.meta).length > 0 && (
        <div className="mt-1.5 flex gap-2 flex-wrap">
          {Object.entries(card.meta).map(([k, v]) => (
            <span
              key={k}
              className="text-xs text-gray-400 dark:text-gray-500"
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
