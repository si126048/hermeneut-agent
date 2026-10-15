const LOGO_PATH =
  'M25 4C14.5 4 6 12 6 22c0 6.5 3.8 12.2 9.5 15.8 ' +
  'C18 39.5 21 41.5 25 46c4-4.5 7-6.5 9.5-8.2 ' +
  'C40 34.2 44 28.5 44 22 44 12 35.5 4 25 4z ' +
  'M25 14a8 8 0 1 1 0 16 8 8 0 0 1 0-16z ' +
  'M25 18a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';

export function LogoSVG({ className, size }: { className?: string; size?: number }) {
  const s = size ?? 84;
  return (
    <svg
      viewBox="0 0 50 50"
      width={s}
      height={s}
      className={className}
      aria-hidden="true"
    >
      <path d={LOGO_PATH} fillRule="evenodd" fill="currentColor" />
    </svg>
  );
}

export { LOGO_PATH };
