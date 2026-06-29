import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BottomSheet = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand/40 animate-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl shadow-2xl animate-slide-up-modal max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-accent">
          <div className="w-10 h-1 bg-accent rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="font-semibold text-brand text-base mt-2">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-brand-muted hover:text-brand hover:bg-surface rounded-lg transition-colors mt-2">
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
