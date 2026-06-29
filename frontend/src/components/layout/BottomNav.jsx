import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, CircleUser } from 'lucide-react';
import { useNotif } from '../../context/NotifContext';

const BottomNav = () => {
  const { unreadCount } = useNotif();

  const navClass = ({ isActive }) => `nav-item ${isActive ? 'active' : 'inactive'}`;

  return (
    <nav className="bottom-nav pb-safe">
      <NavLink to="/" end className={navClass}>
        {({ isActive }) => (
          <>
            <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="nav-label">Home</span>
            {isActive && <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full" />}
          </>
        )}
      </NavLink>

      <NavLink to="/notifications" className={navClass}>
        {({ isActive }) => (
          <>
            <div className="relative">
              <Bell size={22} strokeWidth={isActive ? 2.5 : 2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-danger text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-card">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className="nav-label">Notifications</span>
            {isActive && <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full" />}
          </>
        )}
      </NavLink>

      <NavLink to="/profile" className={navClass}>
        {({ isActive }) => (
          <>
            <CircleUser size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="nav-label">Profile</span>
            {isActive && <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full" />}
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
