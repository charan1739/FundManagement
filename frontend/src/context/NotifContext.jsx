import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  const markRead = async (id) => {
    try { await api.patch(`/notifications/${id}/read`); } catch {}
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    try { await api.patch('/notifications/read'); } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const incrementUnread = () => setUnreadCount((c) => c + 1);
  const prependNotif = (notif) => setNotifications((prev) => [notif, ...prev]);

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, fetch, markRead, markAllRead, incrementUnread, prependNotif }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif must be inside NotifProvider');
  return ctx;
};
