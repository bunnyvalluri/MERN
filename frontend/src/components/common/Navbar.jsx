import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { Button, Avatar } from '../ui/index.js';
import { BrandLogo } from './BrandLogo.jsx';
import {
  Menu,
  X,
  Briefcase,
  Building2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

/**
 * Production-grade responsive Navigation Bar with clean SaaS breakpoints.
 */
export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Find Internships', to: '/internships', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Companies', to: '/companies', icon: <Building2 className="w-4 h-4" /> },
    { label: 'How It Works', href: '/#how-it-works', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Resources', href: '/#resources', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const dashboardPath =
    role === 'ADMIN' || role === 'SUPER_ADMIN'
      ? '/admin'
      : role === 'RECRUITER'
      ? '/recruiter'
      : '/student';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="shrink-0">
          <BrandLogo to="/" size="md" />
        </div>

        {/* Desktop Nav Links (Clean spacing, zero text wrapping) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardPath}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-4 h-4 text-brand-600" />}
                  className="font-bold text-xs"
                >
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Avatar name={user?.name || 'User'} size="sm" />
                <button
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                  aria-label="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-slate-100 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<UserIcon className="w-4 h-4" />}
                onClick={() => navigate('/login')}
                className="font-semibold text-xs text-slate-700"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/register')}
                className="font-bold text-xs shadow-xs"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Menu Trigger (< 1024px) */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/login')}
              className="font-semibold text-xs text-slate-700 sm:hidden"
            >
              Login
            </Button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-xl animate-slide-down px-4 py-6 space-y-4 shadow-modal">
          <nav className="space-y-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <span className="text-slate-400">{link.icon}</span>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <span className="text-slate-400">{link.icon}</span>
                  {link.label}
                </a>
              )
            )}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="primary" fullWidth size="md" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  fullWidth
                  size="md"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    dispatch(logoutUser());
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  fullWidth
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="font-semibold text-xs"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="font-bold text-xs"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
