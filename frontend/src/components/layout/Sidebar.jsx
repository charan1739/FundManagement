import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, Bell, User, Settings,
  LogOut, Wallet, ChevronRight, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-dark-600 z-40 flex flex-col lg:translate-x-0 lg:static lg:h-auto lg:animate-none"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 leading-none text-sm">Fund Manager</h1>
              <p className="text-xs text-slate-500 mt-0.5">Project Finance</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-200 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `sidebar-link group ${isActive ? 'active' : ''}`
              }
            >
              <div className="relative">
                <Icon size={18} />
                {badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-dark-700 mb-2">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
