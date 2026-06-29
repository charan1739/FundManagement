import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications as apiGetNotifications, markAllRead as apiMarkAllRead, markRead as apiMarkRead } from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await apiGetNotifications({ limit: 10 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    await apiMarkRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await apiMarkAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
