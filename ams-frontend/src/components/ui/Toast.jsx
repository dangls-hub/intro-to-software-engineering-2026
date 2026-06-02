/**
 * Toast — Hệ thống thông báo toàn cục (success, error, warning, info).
 *
 * Sử dụng React Context để cho phép bất kỳ component nào
 * gọi showToast() để hiển thị thông báo tạm thời.
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const DEFAULT_DURATION = 4000;

let toastId = 0;

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  const progressRef = useRef(null);

  useEffect(() => {
    const el = progressRef.current;
    if (el) {
      el.style.animationDuration = `${toast.duration}ms`;
    }
  }, [toast.duration]);

  return (
    <div className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`} role="alert">
      <Icon size={18} className="toast-icon" aria-hidden="true" />
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Đóng">
        <X size={14} />
      </button>
      <div className="toast-progress" ref={progressRef} />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    // Mark as exiting for animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);

    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = DEFAULT_DURATION) => {
      const id = ++toastId;
      const toast = { id, message, type, duration, exiting: false };

      setToasts((prev) => [...prev.slice(-4), toast]); // max 5 toasts

      timers.current[id] = setTimeout(() => {
        dismissToast(id);
      }, duration);

      return id;
    },
    [dismissToast],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook để hiển thị toast notification.
 * @returns {(message: string, type?: 'success'|'error'|'warning'|'info', duration?: number) => number}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
