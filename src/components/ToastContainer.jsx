import { useToast } from '../hooks/useToast';
import './ToastContainer.css';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <div className="toast-body">
            {toast.title && <strong className="toast-title">{toast.title}</strong>}
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
