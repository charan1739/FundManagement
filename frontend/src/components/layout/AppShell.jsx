import React from 'react';
import BottomNav from './BottomNav';
import SocketToast from '../ui/SocketToast';

const AppShell = ({ children, hideNav = false }) => (
  <div className="app-shell">
    <SocketToast />
    <div className={`flex-1 flex flex-col min-h-0 ${!hideNav ? 'pb-14' : ''}`}>
      {children}
    </div>
    {!hideNav && <BottomNav />}
  </div>
);

export default AppShell;
