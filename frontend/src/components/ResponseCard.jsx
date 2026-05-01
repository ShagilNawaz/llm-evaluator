import { useState } from 'react';

const VARIANT_CONFIG = {
  A: {
    label: 'Response A',
    badge: 'Low Temp',
    temp: '0.3',
    badgeClass: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
    ringClass: 'ring-brand-500/20',
    dotClass: 'bg-brand-400',
    headerClass: 'from-brand-500/10 to-transparent',
  },
  B: {
    label: 'Response B',
    badge: 'High Temp',
    temp: '0.9',
    badgeClass: 'bg-accent-500/15 text-accent-400 border border-accent-500/30',
    ringClass: 'ring-accent-500/20',
    dotClass: 'bg-accent-400',
    headerClass: 'from-accent-500/10 to-transparent',
  },
};

const PROVIDER_LABELS = {
  groq:       'Groq',
  gemini:     'Gemini',
  ollama:     'Ollama',
  openrouter: 'OpenRouter',
  anthropic:  'Claude',
};

function SkeletonLoader() {
  return (
    <div className="space-y-3 p-5">
      {[100, 90, 95, 70, 85, 50].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full shimmer-bg"
          style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

export default function ResponseCard({ variant, text, loading = false, provider = '' }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = VARIANT_CONFIG[variant];
  const isLong = text && text.length > 600;
  const providerLabel = PROVIDER_LABELS[provider] || provider;

  return (
    <div className={`card flex flex-col ring-1 ${cfg.ringClass} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 bg-gradient-to-r ${cfg.headerClass} border-b border-gray-800/60`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${cfg.dotClass} ${loading ? 'animate-pulse-soft' : ''}`} />
          <span className="font-display font-semibold text-white text-sm">{cfg.label}</span>
          {providerLabel && !loading && (
            <span className="text-[10px] font-mono text-gray-500 bg-gray-800/80 border border-gray-700 px-2 py-0.5 rounded-md">
              {providerLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge text-[10px] ${cfg.badgeClass}`}>
            {cfg.badge}
          </span>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-md">
            temp={cfg.temp}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative">
        {loading ? (
          <SkeletonLoader />
        ) : text ? (
          <>
            <div
              className={`px-5 py-4 font-mono text-[13px] leading-6 text-gray-300 whitespace-pre-wrap overflow-hidden transition-all duration-500 ${
                isLong && !expanded ? 'max-h-64' : 'max-h-none'
              }`}
            >
              {text}
            </div>

            {/* Gradient fade + expand button */}
            {isLong && !expanded && (
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-surface-900 to-transparent flex items-end justify-center pb-3">
                <button
                  onClick={() => setExpanded(true)}
                  className="btn-ghost text-xs gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show full response
                </button>
              </div>
            )}
            {isLong && expanded && (
              <div className="flex justify-center py-2 border-t border-gray-800/60">
                <button onClick={() => setExpanded(false)} className="btn-ghost text-xs gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Collapse
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <svg className="w-8 h-8 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-sm">Response will appear here</p>
          </div>
        )}
      </div>

      {/* Word count */}
      {text && !loading && (
        <div className="px-5 py-2 border-t border-gray-800/60 flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-600">
            {text.split(/\s+/).length} words · {text.length} chars
          </span>
        </div>
      )}
    </div>
  );
}
