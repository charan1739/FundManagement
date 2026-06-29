import React from 'react';
import {
  FileText, CheckCircle, XCircle, ArrowUpRight, Clock, UserPlus, UserMinus, Users, Bell
} from 'lucide-react';
import { formatRelative } from '../utils/formatters';

const ICON_MAP = {
  request_raised: { Icon: FileText, bg: 'bg-warning/20 text-warning' },
  request_approved: { Icon: CheckCircle, bg: 'bg-success/20 text-success' },
  request_rejected: { Icon: XCircle, bg: 'bg-danger/20 text-danger' },
  funds_transferred: { Icon: ArrowUpRight, bg: 'bg-primary/30 text-brand' },
  confirm_pending: { Icon: Clock, bg: 'bg-warning/20 text-warning' },
  member_joined: { Icon: UserPlus, bg: 'bg-primary/30 text-brand' },
  member_removed: { Icon: UserMinus, bg: 'bg-danger/20 text-danger' },
  join_request: { Icon: Users, bg: 'bg-primary/30 text-brand' },
  join_accepted: { Icon: CheckCircle, bg: 'bg-success/20 text-success' },
  join_declined: { Icon: XCircle, bg: 'bg-danger/20 text-danger' },
  funds_added: { Icon: ArrowUpRight, bg: 'bg-success/20 text-success' },
};

const NotificationItem = ({ notif, onClick }) => {
  const { Icon, bg } = ICON_MAP[notif.type] || { Icon: Bell, bg: 'bg-primary/30 text-brand' };

  return (
    <button
      onClick={() => onClick(notif)}
      className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-accent/50 text-left transition-colors ${
        notif.read ? 'bg-card hover:bg-surface/50' : 'bg-surface notif-unread'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.read ? 'font-medium text-brand' : 'font-bold text-brand'}`}>
          {notif.title}
        </p>
        <p className={`text-xs mt-0.5 line-clamp-2 ${notif.read ? 'text-brand-muted' : 'text-brand-sub font-medium'}`}>
          {notif.message}
        </p>
        <p className="text-[10px] text-brand-muted mt-1.5">{formatRelative(notif.createdAt)}</p>
      </div>
    </button>
  );
};

export default NotificationItem;
