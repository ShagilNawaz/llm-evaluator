import { useEffect, useState } from 'react';

const ICONS = {
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-accent-500/10 border-accent-500/30 text-accent-400',
  error: 'bg-danger-500/10 border-danger-500/30 text-danger-400',
  info: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
};

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium
        shadow-xl backdrop-blur-sm max-w-sm transition-all duration-300
        ${STYLES[toast.type] || STYLES.info}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <span className="mt-0.5 flex-shrink-0">{ICONS[toast.type]}</span>
      <span className="flex-1 text-gray-200">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
