import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel, children }) => {
  const btnRef = useRef(null);

  useEffect(() => { if (open) btnRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const confirmClass = variant === 'danger' ? 'btn-danger' : variant === 'success' ? 'btn-success' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand/40 animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl p-6 animate-fade-in space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-brand text-base pr-4">{title}</h3>
          <button onClick={onCancel} className="p-1 text-brand-muted hover:text-brand">
            <X size={16} />
          </button>
        </div>
        {message && <p className="text-sm text-brand-sub leading-relaxed">{message}</p>}
        {children}
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="btn-secondary flex-1">{cancelLabel}</button>
          <button ref={btnRef} onClick={onConfirm} className={`${confirmClass} flex-1`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
