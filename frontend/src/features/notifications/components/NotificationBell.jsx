import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadCount, fetchUserNotifications } from '../notificationSlice.js';
import NotificationDropdown from './NotificationDropdown.jsx';
import { Bell } from 'lucide-react';

export function NotificationBell({ className = '' }) {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.notifications);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Poll / fetch unread count on mount
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!dropdownOpen) {
      dispatch(fetchUserNotifications({ limit: 5 }));
      dispatch(fetchUnreadCount());
    }
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Live Pulse Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-brand-500 rounded-full ring-2 ring-slate-900 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {dropdownOpen && (
        <NotificationDropdown onClose={() => setDropdownOpen(false)} />
      )}
    </div>
  );
}

export default NotificationBell;
