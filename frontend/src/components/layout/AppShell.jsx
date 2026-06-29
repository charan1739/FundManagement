import React from 'react';
import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';
import SocketToast from '../ui/SocketToast';
import { PWAInstallBanner } from '../ui/InstallPWAButton';

const AppShell = ({ children, hideNav = false }) => (
  <div className="min-h-screen bg-surface flex">
    {/* Desktop sidebar — hidden on mobile */}
    {!hideNav && <DesktopSidebar />}

    {/* Main content area */}
    <div className="flex-1 flex flex-col min-h-screen lg:max-w-none">
      <SocketToast />

      {/* Mobile/tablet shell wrapper */}
      <div className={`flex-1 flex flex-col max-w-2xl w-full mx-auto lg:max-w-none lg:mx-0 ${!hideNav ? 'pb-14 lg:pb-0' : ''}`}>
        {children}
      </div>

      {/* Bottom nav — hidden on desktop */}
      {!hideNav && <BottomNav />}
      {!hideNav && <PWAInstallBanner />}
    </div>
  </div>
);

export default AppShell;
