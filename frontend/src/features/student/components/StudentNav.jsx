import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../auth/authSlice.js';
import NotificationBell from '../../notifications/components/NotificationBell.jsx';
import { Avatar, Badge, Button } from '../../../components/ui/index.js';
import {
  Sparkles,
  LayoutDashboard,
  User,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Briefcase,
  Calendar,
} from 'lucide-react';

export function StudentNav() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { completion } = useSelector((state) => state.student);

  const navItems = [
    { to: '/student', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/student/applications', label: 'My Applications', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/student/interviews', label: 'Interviews', icon: <Calendar className="w-4 h-4" /> },
    { to: '/student/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { to: '/student/resume', label: 'Resume & Documents', icon: <FileText className="w-4 h-4" /> },
    { to: '/student/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">InternHub</span>
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
              Student Portal
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-slate-200 hidden md:flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <span>Explore Internships</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <NotificationBell />

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <Avatar name={user?.name || 'Student'} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
                <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[140px]">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => dispatch(logoutUser())}
                className="text-slate-400 hover:text-danger-400 p-1.5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mini completion pill */}
          <div className="hidden lg:flex items-center gap-2 py-2">
            <span className="text-xs text-slate-400">Profile:</span>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completion.percentage >= 80
                    ? 'bg-emerald-500'
                    : completion.percentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-brand-500'
                }`}
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              {completion.percentage}%
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default StudentNav;
