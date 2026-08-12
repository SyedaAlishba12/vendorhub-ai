'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  /** Show a toast notification. Usage: showToast('Saved!', 'success') */
  showToast: (message: string, type?: ToastType) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Dismiss duration ────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 4000;

// ─── Style map ───────────────────────────────────────────────────────────────

const toastStyles: Record<ToastType, string> = {
  success:
    'bg-emerald-50 border-emerald-300 text-emerald-800',
  error:
    'bg-red-50 border-red-300 text-red-800',
  info:
    'bg-indigo-50 border-indigo-300 text-indigo-800',
  warning:
    'bg-amber-50 border-amber-300 text-amber-800',
};

const toastIcons: Record<ToastType, string> = {
  success: '✔',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

// ─── Individual Toast item ────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={() => onDismiss(toast.id)}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg cursor-pointer
        transition-all duration-300 ease-out
        ${toastStyles[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <span className="text-base font-bold select-none leading-none mt-0.5">
        {toastIcons[toast.type]}
      </span>
      <p className="text-xs font-semibold leading-snug">{toast.message}</p>
    </div>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * ToastProvider — wraps your app (or layout) to enable toast notifications.
 * Usage: wrap your root layout with <ToastProvider> then call useToast() anywhere.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack — bottom-right corner */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useToast — returns showToast() to trigger toast notifications from any component.
 * Usage: const { showToast } = useToast(); showToast('Saved!', 'success');
 * Must be used inside <ToastProvider>.
 */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return ctx;
};

export default ToastProvider;
