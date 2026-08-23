import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../auth/authSlice.js';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  FileCheck2,
  FileText,
  BarChart3,
  ShieldAlert,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge, Avatar } from '../../../components/ui/index.js';

const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'recruiters', label: 'Recruiters', icon: Briefcase },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'internships', label: 'Internships', icon: FileCheck2 },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({
  activeSection = 'dashboard',
  onSelectSection,
  collapsed = false,
  onToggleCollapse,
  pendingCount = 0,
  className = '',
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-brand-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white tracking-tight leading-none">
                  InternHub
                </span>
                <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase font-bold mt-0.5">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={collapsed ? section.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-rose-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{section.label}</span>
                )}

                {/* Notification / Alert Pills */}
                {!collapsed && section.id === 'companies' && pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={user?.name || 'Admin'} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-rose-400 font-mono uppercase font-semibold">
                  {user?.role || 'ADMIN'}
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(logoutUser())}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <button
              onClick={() => dispatch(logoutUser())}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default AdminSidebar;
