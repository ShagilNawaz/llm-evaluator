export const DIMENSIONS = [
  { key: 'instructionFollowing', label: 'Instruction Following', description: 'How well the response follows given instructions' },
  { key: 'quality', label: 'Quality', description: 'Overall quality of the writing and reasoning' },
  { key: 'accuracy', label: 'Accuracy', description: 'Factual correctness of the information provided' },
  { key: 'naturalness', label: 'Naturalness', description: 'How natural and human-like the response reads' },
  { key: 'completeness', label: 'Completeness', description: 'Whether the response fully addresses the prompt' },
  { key: 'helpfulness', label: 'Helpfulness', description: 'How useful the response is to the user' },
];

export const VERDICT_OPTIONS = [
  { value: 'response_a_better', label: 'Response A is better', color: 'brand' },
  { value: 'response_b_better', label: 'Response B is better', color: 'accent' },
  { value: 'tie', label: 'Tie', color: 'yellow' },
  { value: 'both_good', label: 'Both Good', color: 'green' },
  { value: 'both_bad', label: 'Both Bad', color: 'red' },
];

export const VERDICT_LABELS = Object.fromEntries(
  VERDICT_OPTIONS.map(v => [v.value, v.label])
);

export function getEmptyScores() {
  return Object.fromEntries(DIMENSIONS.map(d => [d.key, 0]));
}

export function calcAvgScore(scores) {
  const vals = Object.values(scores).filter(v => v > 0);
  if (!vals.length) return 0;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export function getScoreColor(score) {
  if (score >= 4.5) return 'text-accent-400 border-accent-400/50';
  if (score >= 3.5) return 'text-brand-400 border-brand-400/50';
  if (score >= 2.5) return 'text-yellow-400 border-yellow-400/50';
  return 'text-danger-400 border-danger-400/50';
}

export function getScoreBg(score) {
  if (score >= 4.5) return 'bg-accent-500/10';
  if (score >= 3.5) return 'bg-brand-500/10';
  if (score >= 2.5) return 'bg-yellow-500/10';
  return 'bg-danger-500/10';
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function truncate(str, maxLen = 80) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
