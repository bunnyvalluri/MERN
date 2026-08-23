import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../../components/ui/index.js';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
  { id: 'internships', label: 'Internships', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" /> },
  { id: 'candidates', label: 'Candidates', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'interviews', label: 'Interviews', icon: <Calendar className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, hasBadge: true },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export function RecruiterSidebar({
  activeSection = 'overview',
  onSelectSection,
  collapsed = false,
  onToggleCollapse,
  unreadNotifsCount = 0,
  className = '',
}) {
  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Portal Header Branding */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between h-16">
        <Link to="/recruiter" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-sm text-slate-900 tracking-tight block">
                InternHub
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block">
                Recruiter Portal
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle (Desktop) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? section.label : undefined}
            >
              <span className="shrink-0">{section.icon}</span>
              {!collapsed && (
                <span className="truncate flex-1 text-left">{section.label}</span>
              )}

              {/* Unread Notifications Badge */}
              {section.hasBadge && unreadNotifsCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-brand-700'
                      : 'bg-brand-600 text-white'
                  } ${collapsed ? 'absolute top-1 right-1 px-1 text-[9px]' : ''}`}
                >
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Public Discovery Link & Copyright */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <Link
          to="/internships"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 p-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Public Discovery' : undefined}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate font-medium">Public Job Discovery</span>}
        </Link>
        {!collapsed && (
          <div className="text-[10px] text-slate-400 px-2 pt-1 border-t border-slate-100 truncate">
            &copy; {new Date().getFullYear()} InternHub •{' '}
            <a
              href="https://valluri-rahul-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline font-medium"
            >
              VALLURI RAHUL
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

export default RecruiterSidebar;
