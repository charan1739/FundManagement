// Utility helpers for V1

export const fmtCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const fmtDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fmtTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return fmtDate(date);
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const statusLabel = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  transferred: 'Transferred',
  received: 'Received',
  completed: 'Completed',
};

export const statusClass = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  transferred: 'badge-transferred',
  received: 'badge-received',
  completed: 'badge-completed',
};

export const WORKFLOW_STEPS = ['pending', 'approved', 'transferred', 'completed'];
