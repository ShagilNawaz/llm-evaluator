import { useState, useCallback } from 'react';

let id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const toastId = ++id;
    setToasts(prev => [...prev, { id: toastId, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, duration);
  }, []);

  const toast = {
    success: (message) => addToast({ type: 'success', message }),
    error: (message) => addToast({ type: 'error', message }),
    info: (message) => addToast({ type: 'info', message }),
  };

  const dismiss = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  return { toasts, toast, dismiss };
}
