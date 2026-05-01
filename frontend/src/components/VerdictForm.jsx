import { VERDICT_OPTIONS } from '../utils/scores';

const VERDICT_ICONS = {
  response_a_better: '🔵',
  response_b_better: '🟢',
  tie: '🟡',
  both_good: '✅',
  both_bad: '❌',
};

export default function VerdictForm({
  verdict,
  justification,
  evaluatorName,
  onVerdictChange,
  onJustificationChange,
  onEvaluatorNameChange,
  disabled = false,
  errors = {},
}) {
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-gray-800/60">
        <h3 className="font-display font-semibold text-sm text-white">Final Verdict</h3>
        <p className="text-xs text-gray-500 mt-0.5">Submit your overall assessment</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Evaluator Name */}
        <div>
          <label className="label-base">Your Name</label>
          <input
            type="text"
            value={evaluatorName}
            onChange={e => onEvaluatorNameChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Nawaz Ali"
            className={`input-base ${errors.evaluatorName ? 'border-danger-500/50 ring-1 ring-danger-500/30' : ''}`}
          />
          {errors.evaluatorName && (
            <p className="mt-1.5 text-xs text-danger-400">{errors.evaluatorName}</p>
          )}
        </div>

        {/* Verdict grid */}
        <div>
          <label className="label-base">Which response is better?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {VERDICT_OPTIONS.map(opt => {
              const selected = verdict === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onVerdictChange(opt.value)}
                  className={`
                    flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium
                    transition-all duration-150 text-left
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${selected
                      ? 'bg-brand-500/15 border-brand-500/50 text-white shadow-sm shadow-brand-500/10'
                      : 'bg-gray-900/50 border-gray-700/60 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }
                  `}
                >
                  <span className="text-base leading-none">{VERDICT_ICONS[opt.value]}</span>
                  <span className="text-xs leading-tight">{opt.label}</span>
                  {selected && (
                    <svg className="w-3.5 h-3.5 ml-auto text-brand-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {errors.verdict && (
            <p className="mt-1.5 text-xs text-danger-400">{errors.verdict}</p>
          )}
        </div>

        {/* Justification */}
        <div>
          <label className="label-base">
            Justification
            <span className="normal-case text-danger-400 ml-1">*required</span>
          </label>
          <textarea
            value={justification}
            onChange={e => onJustificationChange(e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Explain your reasoning — what made one response better, or why they're equal? Be specific about strengths and weaknesses..."
            className={`input-base resize-none ${errors.justification ? 'border-danger-500/50 ring-1 ring-danger-500/30' : ''}`}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.justification ? (
              <p className="text-xs text-danger-400">{errors.justification}</p>
            ) : (
              <p className="text-xs text-gray-600">Minimum 20 characters</p>
            )}
            <span className={`text-xs font-mono ${justification.length < 20 ? 'text-gray-600' : 'text-accent-400'}`}>
              {justification.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
