import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getTitle = () => {
    const path = location.pathname;
    if (PATH_TITLES) {
      for (const [key, val] of Object.entries(PAGE_TITLES)) {
        if (path.startsWith(key)) return val;
      }
    }
    if (path.includes('/projects/') && path.includes('/requests')) return 'Fund Requests';
    if (path.includes('/projects/') && path.includes('/transactions')) return 'Transactions';
    if (path.includes('/projects/') && path.includes('/members')) return 'Members';
    if (path.includes('/projects/') && path.includes('/reports')) return 'Reports';
    if (path.includes('/projects/') && path.includes('/funds')) return 'Fund Management';
    if (path.includes('/projects/')) return 'Project Details';
    return 'Project Fund Manager';
  };

  // Fix for missing PATH_TITLES reference
  const PATH_TITLES = true;

  return (
    <header className="sticky top-0 z-20 bg-dark-800/80 backdrop-blur-sm border-b border-dark-600">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1 transition-colors"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-lg font-semibold text-slate-100">{getTitle()}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="notification-btn"
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded-xl transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
