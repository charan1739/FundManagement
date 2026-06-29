import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  transferred: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  completed: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  received: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  owner: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  finance_manager: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  member: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  viewer: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  credit: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  debit: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  transferred: 'Transferred',
  completed: 'Completed',
  received: 'Received',
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
  owner: 'Owner',
  finance_manager: 'Finance Manager',
  member: 'Member',
  viewer: 'Viewer',
  credit: 'Credit',
  debit: 'Debit',
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-500/10 text-slate-400';
  const label = STATUS_LABELS[status] || status;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`badge ${style} ${sizeClass} font-medium capitalize`}>
      {label}
    </span>
  );
};

export default StatusBadge;
