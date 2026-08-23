import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../auth/authSlice.js';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Building2,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Badge, Button } from '../../../components/ui/index.js';

export function RecruiterNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/recruiter/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/recruiter/internships',
      label: 'My Postings',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      to: '/recruiter/internships/new',
      label: 'Post Internship',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      to: '/recruiter/company',
      label: 'Company Profile',
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link to="/recruiter/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                InternHub
              </span>
            </Link>
            <Badge variant="success" size="sm">
              Recruiter Portal
            </Badge>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/internships"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Public Discovery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {user?.name || 'Recruiter'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {user?.email || 'recruiter@company.com'}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Recruiter Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default RecruiterNav;
