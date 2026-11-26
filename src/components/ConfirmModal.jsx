import { useRef, useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import './ConfirmModal.css';

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef, isOpen, onCancel);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onCancel) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        tabIndex={-1}
      >
        <div className="confirm-modal-header">
          <h2 id="confirm-modal-title" className="confirm-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="confirm-modal-close"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
          >
            &times;
          </button>
        </div>
        <p id="confirm-modal-description" className="confirm-modal-message">
          {message}
        </p>
        <div className="confirm-modal-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
