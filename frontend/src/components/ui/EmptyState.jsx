import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, subtitle, actionLabel, onAction }) => (
  <div className="empty-state">
    {Icon && (
      <div className="w-16 h-16 bg-accent/50 rounded-full flex items-center justify-center">
        <Icon size={28} className="text-secondary" strokeWidth={1.5} />
      </div>
    )}
    <div>
      <p className="font-semibold text-brand text-base">{title}</p>
      {subtitle && <p className="text-sm text-brand-muted mt-1">{subtitle}</p>}
    </div>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="mt-1">{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;
