import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, CircleUser, Wallet, LogOut, DownloadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { getInitials, avatarColor } from '../../utils/formatters';

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/profile', icon: CircleUser, label: 'Profile' },
];

const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotif();
  const { canInstall, install } = usePWAInstall();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 bg-card border-r border-accent flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-accent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-card flex-shrink-0">
            <Wallet size={20} className="text-brand" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-brand text-base leading-none">Fund Manager</h1>
            <p className="text-xs text-brand-muted mt-0.5">Group-based project finance</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-brand shadow-sm'
                  : 'text-brand-sub hover:bg-surface hover:text-brand'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-card">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* PWA Install Button */}
      {canInstall && (
        <div className="px-3 pb-3">
          <button
            onClick={install}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-accent text-sm font-medium text-brand-sub hover:border-primary hover:text-brand hover:bg-surface transition-all"
          >
            <DownloadCloud size={18} className="flex-shrink-0" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* User Profile + Logout */}
      <div className="px-3 pb-4 border-t border-accent pt-3 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-brand flex-shrink-0"
            style={{ backgroundColor: avatarColor(user?.name || '') }}
          >
            {getInitials(user?.name || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand truncate">{user?.name}</p>
            <p className="text-xs text-brand-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-sub hover:text-danger hover:bg-danger/5 transition-all"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
