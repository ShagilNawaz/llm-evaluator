import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { DIMENSIONS } from '../utils/scores';

const SHORT_LABELS = {
  instructionFollowing: 'Instr.',
  quality: 'Quality',
  accuracy: 'Accuracy',
  naturalness: 'Natural.',
  completeness: 'Complete.',
  helpfulness: 'Helpful.',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl shadow-black/40 text-xs">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-mono font-semibold text-white">{p.value?.toFixed(2) ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload?.map(p => (
        <div key={p.value} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
          <span className="text-xs text-gray-400">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScoreChart({ data, loading }) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-48 shimmer-bg rounded mb-6" />
        <div className="flex items-end gap-4 h-48">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex gap-1 items-end">
              <div className="flex-1 shimmer-bg rounded-t" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 80}ms` }} />
              <div className="flex-1 shimmer-bg rounded-t" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 80 + 40}ms` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-8 h-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
        </svg>
        <p className="text-sm text-gray-500">No analytics data yet</p>
        <p className="text-xs text-gray-600 mt-1">Complete some evaluations first</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-white text-sm">Average Scores by Dimension</h3>
        <p className="text-xs text-gray-500 mt-0.5">Comparing Response A vs Response B across all evaluations</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="avgA" name="Response A" fill="#6366f1" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#6366f1" fillOpacity={0.85} />
            ))}
          </Bar>
          <Bar dataKey="avgB" name="Response B" fill="#10b981" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#10b981" fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
