import { useEffect, useRef } from "react";

export function PageHeader({ eyebrow, title, description, actions = null }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, helper = null, tone = "default", icon }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-card-top"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span></div>
      <div className="stat-value">{value}</div>
      {helper && <div className="stat-helper">{helper}</div>}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">◇</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return <div className="loading-block"><span className="spinner" /> {label}</div>;
}

export function ErrorPanel({ message, onRetry = null }) {
  return (
    <div className="alert alert-danger">
      <div><strong>Couldn’t load this section.</strong><div>{message}</div></div>
      {onRetry && <button className="btn btn-sm btn-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function FieldError({ children }) {
  return children ? <div className="field-error">{children}</div> : null;
}

export function ConfirmDialog({ open, title, message, confirmText = "Confirm", tone = "danger", onConfirm, onCancel, busy }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const buttons = () => [...(dialog.current?.querySelectorAll('button:not(:disabled)') || [])];
    buttons()[0]?.focus();
    const handleKey = event => {
      if (event.key === 'Escape' && !busy) onCancel();
      if (event.key === 'Tab') {
        const controls = buttons();
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [open, busy, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div ref={dialog} className="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`btn btn-${tone}`} onClick={onConfirm} disabled={busy}>{busy ? "Working…" : confirmText}</button>
        </div>
      </div>
    </div>
  );
}
