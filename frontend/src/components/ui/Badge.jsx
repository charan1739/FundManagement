import React from 'react';

const variantMap = {
  admin: 'badge-admin',
  member: 'badge-member',
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  transferred: 'badge-transferred',
  received: 'badge-received',
  completed: 'badge-completed',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  primary: 'badge-admin',
  accent: 'badge-member',
};

const labelMap = {
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
  transferred: 'Transferred', received: 'Received', completed: 'Completed',
  admin: 'Admin', member: 'Member',
};

const Badge = ({ variant = 'member', label, children }) => (
  <span className={`badge ${variantMap[variant] || 'badge-member'}`}>
    {label ?? labelMap[variant] ?? children}
  </span>
);

export default Badge;
