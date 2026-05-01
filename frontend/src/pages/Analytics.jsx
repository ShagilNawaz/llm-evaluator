import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import ScoreChart from '../components/ScoreChart';
import { fetchAnalytics } from '../services/api';
import { VERDICT_LABELS } from '../utils/scores';

const VERDICT_COLORS = {
  response_a_better: '#6366f1',
  response_b_better: '#10b981',
  tie: '#f59e0b',
  both_good: '#22c55e',
  both_bad: '#ef4444',
};

function StatCard({ label, value, sub, color = 'brand', icon }) {
  const colorClasses = {
    brand: 'bg-brand-500/10 border-brand-500/20 text-brand-400',
    accent: 'bg-accent-500/10 border-accent-500/20 text-accent-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    red: 'bg-danger-500/10 border-danger-500/20 text-danger-400',
  };
  return (
    <div className={`card border p-5 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="font-display font-bold text-3xl text-white mb-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-surface-900 border border-gray-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="font-mono text-gray-300">{d.value} evaluations ({d.payload.pct}%)</p>
    </div>
  );
}

export default function Analytics({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchAnalytics();
        setData(res);
      } catch (err) {
        toast.error(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const chartData = data?.dimensionAverages?.map(d => ({
    dimension: d.shortLabel || d.dimension,
    avgA: parseFloat(d.avgA?.toFixed(2) || 0),
    avgB: parseFloat(d.avgB?.toFixed(2) || 0),
  })) || [];

  const verdictData = data?.verdictDistribution
    ? Object.entries(data.verdictDistribution).map(([k, v]) => ({
        name: VERDICT_LABELS[k] || k,
        value: v,
        pct: data.totalEvaluations ? Math.round((v / data.totalEvaluations) * 100) : 0,
        color: VERDICT_COLORS[k] || '#6b7280',
      }))
    : [];

  const radarData = data?.dimensionAverages?.map(d => ({
    subject: d.shortLabel || d.dimension,
    A: parseFloat(d.avgA?.toFixed(2) || 0),
    B: parseFloat(d.avgB?.toFixed(2) || 0),
    fullMark: 5,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display font-bold text-2xl text-white mb-1">
          Evaluation <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-sm text-gray-500">Aggregate insights across all evaluations</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-slide-up">
        <StatCard
          label="Total Evaluations"
          value={loading ? '…' : data?.totalEvaluations ?? 0}
          icon="📋"
          color="brand"
        />
        <StatCard
          label="Avg Score A"
          value={loading ? '…' : data?.overallAvgA?.toFixed(2) ?? '—'}
          sub="Response A average"
          icon="🔵"
          color="brand"
        />
        <StatCard
          label="Avg Score B"
          value={loading ? '…' : data?.overallAvgB?.toFixed(2) ?? '—'}
          sub="Response B average"
          icon="🟢"
          color="accent"
        />
        <StatCard
          label="A vs B Win Rate"
          value={loading ? '…' : data?.totalEvaluations
            ? `${Math.round(((data?.verdictDistribution?.response_a_better || 0) / data.totalEvaluations) * 100)}%`
            : '—'}
          sub="A wins percentage"
          icon="🏆"
          color="yellow"
        />
      </div>

      {/* Bar chart */}
      <div className="mb-4 animate-slide-up animate-delay-100">
        <ScoreChart data={chartData} loading={loading} />
      </div>

      {/* Verdict + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up animate-delay-200">
        {/* Verdict distribution pie */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Verdict Distribution</h3>
            <p className="text-xs text-gray-500 mt-0.5">How evaluators voted overall</p>
          </div>

          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full shimmer-bg" />
            </div>
          ) : verdictData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={verdictData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {verdictData.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-col gap-2">
                {verdictData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-400 flex-1">{d.name}</span>
                    <span className="text-xs font-mono text-white font-semibold">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Radar chart */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Dimension Radar</h3>
            <p className="text-xs text-gray-500 mt-0.5">Comparative shape of both responses</p>
          </div>

          {loading ? (
            <div className="h-52 shimmer-bg rounded-xl" />
          ) : radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'DM Sans' }}
                />
                <Radar name="Response A" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Response B" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d0e14',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Dimension detail table */}
      {!loading && data?.dimensionAverages?.length > 0 && (
        <div className="card mt-4 overflow-hidden animate-slide-up animate-delay-300">
          <div className="px-5 py-3.5 border-b border-gray-800/60">
            <h3 className="font-display font-semibold text-white text-sm">Dimension Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800/40">
                  {['Dimension', 'Avg A', 'Avg B', 'Δ Diff', 'Winner'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.dimensionAverages.map((d, i) => {
                  const diff = (d.avgA - d.avgB).toFixed(2);
                  const winner = diff > 0 ? 'A' : diff < 0 ? 'B' : 'Tie';
                  return (
                    <tr key={i} className="border-b border-gray-800/30 hover:bg-gray-800/10 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-300">{d.dimension}</td>
                      <td className="px-5 py-3 font-mono text-sm text-brand-400">{d.avgA?.toFixed(2)}</td>
                      <td className="px-5 py-3 font-mono text-sm text-accent-400">{d.avgB?.toFixed(2)}</td>
                      <td className={`px-5 py-3 font-mono text-sm ${diff > 0 ? 'text-brand-400' : diff < 0 ? 'text-accent-400' : 'text-gray-500'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge text-[11px] border
                          ${winner === 'A' ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' :
                            winner === 'B' ? 'bg-accent-500/10 text-accent-400 border-accent-500/30' :
                            'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {winner === 'A' ? 'Resp. A' : winner === 'B' ? 'Resp. B' : 'Tie'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
