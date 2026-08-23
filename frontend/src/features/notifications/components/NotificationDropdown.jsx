import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../notificationSlice.js';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Briefcase,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Badge, Button } from '../../../components/ui/index.js';

// Helper to render contextual icons for notification types
const getNotificationIcon = (type) => {
  switch (type) {
    case 'REGISTRATION_WELCOME':
    case 'EMAIL_VERIFIED':
      return <Sparkles className="w-4 h-4 text-brand-400" />;
    case 'APPLICATION_SUBMITTED':
    case 'NEW_APPLICATION_RECEIVED':
    case 'APPLICATION_REVIEWED':
    case 'APPLICATION_SHORTLISTED':
    case 'APPLICATION_SELECTED':
    case 'APPLICATION_REJECTED':
      return <Briefcase className="w-4 h-4 text-blue-400" />;
    case 'INTERVIEW_SCHEDULED':
    case 'INTERVIEW_RESCHEDULED':
    case 'INTERVIEW_CANCELLED':
      return <Calendar className="w-4 h-4 text-teal-400" />;
    default:
      return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

// Helper for relative time-ago format
const getTimeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export function NotificationDropdown({ onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const list = (notifications?.data || []).slice(0, 5);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      dispatch(markNotificationAsRead(notif._id));
    }
    if (onClose) onClose();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  return (
    <div
      className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dropdown Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-[10px] font-bold text-white font-mono">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto no-scrollbar divide-y divide-slate-800/60">
        {list.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 space-y-1">
            <Bell className="w-6 h-6 text-slate-700 mx-auto" />
            <p>No notifications yet</p>
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 hover:bg-slate-800/60 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                !item.read ? 'bg-brand-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-0.5">
                    {getTimeAgo(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleDelete(e, item._id)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-2.5 border-t border-slate-800 text-center bg-slate-950/60">
        <Link
          to="/notifications"
          onClick={() => {
            if (onClose) onClose();
          }}
          className="text-xs font-bold text-brand-400 hover:text-brand-300 block py-1 transition-colors"
        >
          View All in Notification Center →
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;
