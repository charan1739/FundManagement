import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotif } from './NotifContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { incrementUnread, prependNotif } = useNotif();
  const socketRef = useRef(null);

  // Toast state for socket-triggered notifications
  const [socketToast, setSocketToast] = useState(null);
  // In-group refresh banner state
  const [groupActivity, setGroupActivity] = useState(null); // { groupId, action, timestamp }
  const [balanceUpdate, setBalanceUpdate] = useState(null); // { groupId, newBalance }

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', {
      query: { userId: user._id },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('notification:new', (notif) => {
      incrementUnread();
      prependNotif(notif);
      setSocketToast({ ...notif, key: Date.now() });
    });

    socket.on('group:activity', (data) => {
      setGroupActivity({ ...data, key: Date.now() });
    });

    socket.on('balance:updated', (data) => {
      setBalanceUpdate({ ...data, key: Date.now() });
    });

    socket.on('request:status_changed', (data) => {
      // Trigger group activity refresh
      setGroupActivity({ groupId: data.groupId, action: 'Request updated', key: Date.now() });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user?._id]);

  const joinGroup = useCallback((groupId) => {
    socketRef.current?.emit('join:group', groupId);
  }, []);

  const leaveGroup = useCallback((groupId) => {
    socketRef.current?.emit('leave:group', groupId);
    setGroupActivity(null);
    setBalanceUpdate(null);
  }, []);

  const clearGroupActivity = () => setGroupActivity(null);
  const clearBalanceUpdate = () => setBalanceUpdate(null);
  const clearSocketToast = () => setSocketToast(null);

  return (
    <SocketContext.Provider value={{ socketToast, groupActivity, balanceUpdate, joinGroup, leaveGroup, clearGroupActivity, clearBalanceUpdate, clearSocketToast }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
