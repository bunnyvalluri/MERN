import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
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
  ShieldCheck,
  LogOut,
  Radio,
  HelpCircle,
} from 'lucide-react';
import { Avatar, Badge } from '../../../components/ui/index.js';

const NAV_GROUPS = [
  {
    groupTitle: 'Core',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortcut: '⌘1' },
      { id: 'internships', label: 'Internships', icon: Briefcase, shortcut: '⌘2' },
    ],
  },
  {
    groupTitle: 'Talent & Pipeline',
    items: [
      { id: 'applications', label: 'Applications', icon: Users, badgeKey: 'applications' },
      { id: 'candidates', label: 'Candidates', icon: UserCheck },
      { id: 'interviews', label: 'Interviews', icon: Calendar, badgeKey: 'interviews' },
    ],
  },
  {
    groupTitle: 'Organization & Account',
    items: [
      { id: 'company', label: 'Company Profile', icon: Building2 },
      { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'notifications' },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function RecruiterSidebar({
  activeSection = 'overview',
  onSelectSection,
  collapsed = false,
  onToggleCollapse,
  unreadNotifsCount = 0,
  applicationsCount = 0,
  upcomingInterviewsCount = 0,
  className = '',
}) {
  const { user } = useSelector((state) => state.auth);
  const { company } = useSelector((state) => state.recruiter);

  const companyName = company?.name || user?.name ? `${company?.name || user?.name + "'s Team"}` : 'Acme Inc';
  const companyLogo = company?.logo || null;
  const companySlug = company?.slug || '';
  const isVerified = Boolean(company?.verified ?? true);

  const getBadgeCount = (badgeKey) => {
    if (badgeKey === 'notifications') return unreadNotifsCount;
    if (badgeKey === 'applications') return applicationsCount;
    if (badgeKey === 'interviews') return upcomingInterviewsCount;
    return 0;
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 transition-all duration-200 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* ── Workspace & Portal Header ─────────────────────────────── */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between h-18 shrink-0">
        <Link to="/recruiter" className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
          <CompanyLogo
            companyName={companyName}
            slug={companySlug}
            logo={companyLogo}
            className="w-10 h-10 rounded-xl p-1 shrink-0 border border-slate-200/80 shadow-2xs"
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate tracking-tight">
                  {companyName}
                </span>
                {isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" title="Verified Employer" />
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Recruiter Portal
              </span>
            </div>
          )}
        </Link>

        {/* Collapse Toggle Button (Desktop only) */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Grouped Navigation Items ──────────────────────────────── */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto no-scrollbar touch-scroll">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {group.groupTitle}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200/90 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Left Active Accent Bar */}
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-brand-600 rounded-r-full" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                      isActive ? 'text-brand-600 scale-105' : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-105'
                    }`}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1 text-left tracking-tight">{item.label}</span>
                  )}

                  {/* Dynamic Badge Counter */}
                  {badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-700'
                      } ${collapsed ? 'absolute -top-1 -right-1 px-1 text-[9px] shadow-xs' : ''}`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Footer: Public Discovery + Recruiter Profile Card ─────── */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
        {/* Quick Link to Public Board */}
        <Link
          to="/internships"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-2xs ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Open Public Candidate View"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {!collapsed && <span className="truncate">Public Live Stream</span>}
        </Link>

        {/* User Card */}
        {!collapsed ? (
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <Avatar src={user?.avatar} name={user?.name || 'Recruiter'} size="xs" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user?.name || 'Verified Recruiter'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight font-mono">
                  {user?.email || 'recruiter@company.com'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <Avatar src={user?.avatar} name={user?.name || 'Recruiter'} size="xs" />
          </div>
        )}
      </div>
    </aside>
  );
}

export default RecruiterSidebar;
