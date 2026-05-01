import { DIMENSIONS } from '../utils/scores';

const SCORE_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

function StarButton({ value, current, onChange, disabled }) {
  const filled = value <= current;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`transition-all duration-100 disabled:cursor-not-allowed ${
        filled ? 'text-brand-400 scale-110' : 'text-gray-700 hover:text-gray-500'
      }`}
      title={SCORE_LABELS[value]}
    >
      <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z" />
      </svg>
    </button>
  );
}

function DimensionRow({ dimension, value, onChange, variant, disabled }) {
  const accentClass = variant === 'A' ? 'text-brand-400' : 'text-accent-400';
  const activeFilledClass = variant === 'A'
    ? '[&.active]:text-brand-400'
    : '[&.active]:text-accent-400';

  return (
    <div className="flex items-center gap-3 py-2.5 group">
      <div className="w-40 flex-shrink-0">
        <span className="text-[13px] font-medium text-gray-300">{dimension.label}</span>
      </div>

      {/* Stars row */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => {
          const filled = n <= value;
          const isVariantA = variant === 'A';
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dimension.key, n)}
              className={`transition-all duration-100 disabled:cursor-not-allowed
                ${filled
                  ? isVariantA ? 'text-brand-400' : 'text-accent-400'
                  : 'text-gray-700 hover:text-gray-500'}
              `}
              title={SCORE_LABELS[n]}
            >
              <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Score badge */}
      <div className={`w-7 text-center text-xs font-mono font-semibold ${value ? (variant === 'A' ? 'text-brand-400' : 'text-accent-400') : 'text-gray-700'}`}>
        {value || '—'}
      </div>

      {/* Label */}
      <span className={`text-xs transition-opacity duration-150 ${value ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'} text-gray-400`}>
        {value ? SCORE_LABELS[value] : ''}
      </span>
    </div>
  );
}

export default function DimensionRater({ variant, scores, onChange, disabled = false }) {
  const variantConfig = {
    A: { title: 'Rate Response A', accent: 'text-brand-400', border: 'border-brand-500/20', bg: 'from-brand-500/5' },
    B: { title: 'Rate Response B', accent: 'text-accent-400', border: 'border-accent-500/20', bg: 'from-accent-500/5' },
  };
  const cfg = variantConfig[variant];

  const allRated = DIMENSIONS.every(d => scores[d.key] > 0);
  const ratedCount = DIMENSIONS.filter(d => scores[d.key] > 0).length;

  return (
    <div className={`card border ${cfg.border} bg-gradient-to-b ${cfg.bg} to-transparent`}>
      <div className="px-5 py-4 border-b border-gray-800/60 flex items-center justify-between">
        <div>
          <h3 className={`font-display font-semibold text-sm ${cfg.accent}`}>{cfg.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Rate each dimension 1–5</p>
        </div>
        <div className="text-xs font-mono text-gray-500">
          {ratedCount}/{DIMENSIONS.length}
          {allRated && (
            <span className="ml-2 text-accent-400">✓</span>
          )}
        </div>
      </div>

      <div className="px-5 py-2 divide-y divide-gray-800/50">
        {DIMENSIONS.map(dim => (
          <DimensionRow
            key={dim.key}
            dimension={dim}
            value={scores[dim.key] || 0}
            onChange={onChange}
            variant={variant}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-t border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${variant === 'A' ? 'bg-brand-500' : 'bg-accent-500'}`}
              style={{ width: `${(ratedCount / DIMENSIONS.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-gray-600">{Math.round((ratedCount / DIMENSIONS.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
