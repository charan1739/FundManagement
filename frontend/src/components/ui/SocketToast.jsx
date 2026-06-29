import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import {
  FileText, CheckCircle, XCircle, ArrowUpRight, Clock, UserPlus, UserMinus, Users, Bell
} from 'lucide-react';

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

const SocketToast = () => {
  const { socketToast, clearSocketToast } = useSocket();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!socketToast) return;
    setCurrent(socketToast);
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(clearSocketToast, 350);
    }, 4000);
    return () => clearTimeout(t);
  }, [socketToast?.key]);

  if (!current) return null;

  const { Icon, bg } = ICON_MAP[current.type] || { Icon: Bell, bg: 'bg-primary/30 text-brand' };

  const handleClick = () => {
    setVisible(false);
    clearSocketToast();
    if (current.relatedGroup?._id) navigate(`/groups/${current.relatedGroup._id}`);
  };

  return (
    <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-auto ${visible ? 'animate-slide-down' : 'animate-slide-up'}`}>
      <button onClick={handleClick} className="w-full flex items-center gap-3 bg-card border border-accent rounded-2xl px-4 py-3 shadow-lg text-left">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brand truncate">{current.title}</p>
          <p className="text-xs text-brand-sub truncate">{current.message}</p>
        </div>
      </button>
    </div>
  );
};

export default SocketToast;
