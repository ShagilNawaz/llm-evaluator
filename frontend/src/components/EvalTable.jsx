import { VERDICT_LABELS, calcAvgScore, getScoreColor, getScoreBg, formatDate, truncate } from '../utils/scores';

const VERDICT_BADGE_CLASS = {
  response_a_better: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
  response_b_better: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  tie: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  both_good: 'bg-green-500/15 text-green-400 border-green-500/30',
  both_bad: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
};

function ScorePill({ score }) {
  if (!score && score !== 0) return <span className="text-gray-600 text-xs">—</span>;
  const num = parseFloat(score);
  return (
    <span className={`inline-flex items-center justify-center w-9 h-6 rounded-md text-xs font-mono font-semibold border ${getScoreColor(num)} ${getScoreBg(num)}`}>
      {num.toFixed(1)}
    </span>
  );
}

function ExpandedRow({ evaluation }) {
  return (
    <tr className="bg-surface-900/50">
      <td colSpan={7} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">Full Prompt</p>
            <p className="text-sm text-gray-300 leading-relaxed">{evaluation.prompt}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-widest">Justification</p>
            <p className="text-sm text-gray-300 leading-relaxed">{evaluation.justification || '—'}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function TableRow({ evaluation }) {
  const avgA = calcAvgScore(evaluation.scoresA || {});
  const avgB = calcAvgScore(evaluation.scoresB || {});

  // local expanded state per row
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <tr
        className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors duration-100 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Prompt */}
        <td className="px-4 py-3.5 max-w-[200px]">
          <p className="text-sm text-gray-300 truncate">{truncate(evaluation.prompt, 60)}</p>
        </td>

        {/* Evaluator */}
        <td className="px-4 py-3.5 hidden md:table-cell">
          <span className="text-xs text-gray-400 font-medium">{evaluation.evaluatorName || '—'}</span>
        </td>

        {/* Scores A */}
        <td className="px-4 py-3.5 text-center">
          <ScorePill score={avgA} />
        </td>

        {/* Scores B */}
        <td className="px-4 py-3.5 text-center">
          <ScorePill score={avgB} />
        </td>

        {/* Verdict */}
        <td className="px-4 py-3.5">
          <span className={`badge border text-[11px] ${VERDICT_BADGE_CLASS[evaluation.verdict] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {VERDICT_LABELS[evaluation.verdict] || evaluation.verdict || '—'}
          </span>
        </td>

        {/* Date */}
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <span className="text-xs font-mono text-gray-500">{formatDate(evaluation.createdAt)}</span>
        </td>

        {/* Expand */}
        <td className="px-4 py-3.5 text-right">
          <svg
            className={`w-4 h-4 text-gray-600 ml-auto transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
      {expanded && <ExpandedRow evaluation={evaluation} />}
    </>
  );
}

// Need React import for useState in TableRow
import React from 'react';

export default function EvalTable({ evaluations, loading, pagination, onPageChange }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/60">
          <div className="h-4 w-32 shimmer-bg rounded" />
        </div>
        <div className="divide-y divide-gray-800/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-3 flex-1 shimmer-bg rounded" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="h-3 w-24 shimmer-bg rounded" style={{ animationDelay: `${i * 60 + 30}ms` }} />
              <div className="h-3 w-16 shimmer-bg rounded" style={{ animationDelay: `${i * 60 + 60}ms` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!evaluations?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base font-display font-semibold text-gray-400 mb-1">No evaluations yet</h3>
        <p className="text-sm text-gray-600">Complete your first evaluation to see it here.</p>
      </div>
    );
  }

  const { page, totalPages, total } = pagination || {};

  return (
    <div className="card overflow-hidden">
      {/* Table header info */}
      <div className="px-5 py-3.5 border-b border-gray-800/60 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Showing <span className="text-gray-300 font-medium">{evaluations.length}</span> of{' '}
          <span className="text-gray-300 font-medium">{total || evaluations.length}</span> evaluations
        </span>
        <span className="text-xs font-mono text-gray-600">Click a row to expand</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800/60">
              {['Prompt', 'Evaluator', 'Avg A', 'Avg B', 'Verdict', 'Date', ''].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-widest
                    ${i === 1 ? 'hidden md:table-cell' : ''}
                    ${i === 5 ? 'hidden lg:table-cell' : ''}
                    ${i === 2 || i === 3 ? 'text-center' : ''}
                  `}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evaluations.map(ev => (
              <TableRow key={ev._id} evaluation={ev} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-gray-800/60 flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-xs font-mono text-gray-500">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
