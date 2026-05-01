import { useState, useEffect, useCallback } from 'react';
import EvalTable from '../components/EvalTable';
import { fetchEvaluations, exportEvaluations } from '../services/api';

export default function History({ toast }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await fetchEvaluations({ page: p, limit: 10 });
      setEvaluations(data.evaluations || data);
      setPagination({
        page: data.page || p,
        totalPages: data.totalPages || 1,
        total: data.total || (data.evaluations || data).length,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load evaluations.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportEvaluations();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `llm-evaluations-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded!');
    } catch (err) {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">
            Evaluation <span className="text-gradient">History</span>
          </h1>
          <p className="text-sm text-gray-500">Browse all past evaluations and their verdicts</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="btn-secondary"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || loading || !evaluations.length}
            className="btn-primary"
          >
            {exporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export JSON
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!loading && evaluations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up">
          {[
            { label: 'Total Evaluations', value: pagination.total, icon: '📋' },
            { label: 'Pages', value: pagination.totalPages, icon: '📄' },
            { label: 'Current Page', value: pagination.page, icon: '📍' },
            { label: 'Per Page', value: evaluations.length, icon: '👁' },
          ].map(stat => (
            <div key={stat.label} className="card px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{stat.icon}</span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="font-display font-bold text-xl text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="animate-slide-up animate-delay-100">
        <EvalTable
          evaluations={evaluations}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
