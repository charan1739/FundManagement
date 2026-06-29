/** Format number as ₹ Indian currency — e.g. ₹1,25,000 */
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

/** Format Date as IST — e.g. "28 Jun 2026, 3:45 PM" */
export const formatIST = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/** Relative time — e.g. "2m ago", "1h ago", "3d ago" */
export const formatRelative = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatIST(date);
};

/** Get initials from full name — "Santosh Kumar" → "SK" */
export const getInitials = (name = '') =>
  name.trim().split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('');

/** Deterministic avatar background color from name hash */
const AVATAR_COLORS = [
  '#B1B2FF', '#AAC4FF', '#D2DAFF', '#A5B4FC', '#C4B5FD',
  '#93C5FD', '#6EE7B7', '#FDE68A', '#FCA5A5', '#F9A8D4',
];
export const avatarColor = (name = '') => {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/** Map notification type to a date-grouping label */
export const dateGroupLabel = (date) => {
  if (!date) return 'Earlier';
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
};
