import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../notificationSlice.js';
import StudentNav from '../../student/components/StudentNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Breadcrumbs,
} from '../../../components/ui/index.js';
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  Briefcase,
  Calendar,
  ShieldCheck,
  Filter,
  ArrowLeft,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Notifications' },
  { id: 'UNREAD', label: 'Unread Only' },
  { id: 'APPLICATIONS', label: 'Applications' },
  { id: 'INTERVIEWS', label: 'Interviews' },
  { id: 'SYSTEM', label: 'System & Account' },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case 'REGISTRATION_WELCOME':
    case 'EMAIL_VERIFIED':
      return <Sparkles className="w-5 h-5 text-brand-400" />;
    case 'APPLICATION_SUBMITTED':
    case 'NEW_APPLICATION_RECEIVED':
    case 'APPLICATION_REVIEWED':
    case 'APPLICATION_SHORTLISTED':
    case 'APPLICATION_SELECTED':
    case 'APPLICATION_REJECTED':
    case 'APPLICATION_STATUS_UPDATED':
      return <Briefcase className="w-5 h-5 text-blue-400" />;
    case 'INTERVIEW_SCHEDULED':
    case 'INTERVIEW_RESCHEDULED':
    case 'INTERVIEW_CANCELLED':
      return <Calendar className="w-5 h-5 text-teal-400" />;
    default:
      return <Bell className="w-5 h-5 text-slate-400" />;
  }
};

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

export function NotificationCenterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const params = { limit: 50 };
    if (activeCategory === 'UNREAD') {
      params.unreadOnly = 'true';
    }
    dispatch(fetchUserNotifications(params));
  }, [dispatch, activeCategory]);

  const rawList = notifications?.data || [];

  // Filter list by category client-side
  const filteredList = rawList.filter((item) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'UNREAD') return !item.read;
    if (activeCategory === 'APPLICATIONS') {
      return (
        item.type.startsWith('APPLICATION_') ||
        item.type === 'NEW_APPLICATION_RECEIVED'
      );
    }
    if (activeCategory === 'INTERVIEWS') {
      return item.type.startsWith('INTERVIEW_');
    }
    if (activeCategory === 'SYSTEM') {
      return (
        item.type === 'REGISTRATION_WELCOME' ||
        item.type === 'EMAIL_VERIFIED' ||
        item.type === 'SYSTEM_ALERT'
      );
    }
    return true;
  });

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleClearRead = () => {
    dispatch(clearReadNotifications());
  };

  const handleItemClick = (item) => {
    if (!item.read) {
      dispatch(markNotificationAsRead(item._id));
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const isRecruiter = user?.role === 'RECRUITER';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/20 selection:text-brand-300">
      {/* If student, render student portal navigation */}
      {!isRecruiter && <StudentNav />}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Breadcrumbs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                {
                  label: isRecruiter ? 'Recruiter Dashboard' : 'Student Hub',
                  path: isRecruiter ? '/recruiter' : '/student/dashboard',
                },
                { label: 'Notification Center', active: true },
              ]}
            />
            {isRecruiter && (
              <Link to="/recruiter">
                <Button variant="ghost" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Portal
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  Notification Center
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="sm">
                      {unreadCount} Unread
                    </Badge>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Stay updated on application progress, interview schedules, and organization alerts.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  leftIcon={<CheckCheck className="w-4 h-4" />}
                >
                  Mark All Read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearRead}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="text-slate-400 hover:text-red-400"
              >
                Clear Read
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notification Cards Stream */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : filteredList.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/60 py-16">
            <CardContent>
              <EmptyState
                icon={<Bell className="w-12 h-12 text-slate-600 mx-auto" />}
                title={
                  activeCategory === 'UNREAD'
                    ? 'All caught up!'
                    : 'No notifications in this category'
                }
                description="When activity occurs on your applications or interviews, updates will appear here."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item) => (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card ${
                  !item.read
                    ? 'bg-slate-900/95 border-brand-500/40 hover:border-brand-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0 ring-2 ring-brand-500/30" />
                      )}
                      <h3 className="text-sm font-bold text-white truncate">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        • {getTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.link && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                  )}

                  {!item.read && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(markNotificationAsRead(item._id));
                      }}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-slate-400 hover:text-white" />
                    </Button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteNotification(item._id));
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationCenterPage;
