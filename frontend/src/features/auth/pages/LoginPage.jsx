import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../authSlice.js';
import { Alert } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { BrandLogo } from '../../../components/common/BrandLogo.jsx';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'STUDENT',
    title: 'Student',
    email: 'student@internhub.dev',
    password: 'Student123!',
    icon: GraduationCap,
    desc: 'Browse & apply',
  },
  {
    role: 'RECRUITER',
    title: 'Recruiter',
    email: 'recruiter@stripe.com',
    password: 'Recruiter123!',
    icon: Building2,
    desc: 'Post & review',
  },
  {
    role: 'ADMIN',
    title: 'Admin',
    email: 'admin@internhub.dev',
    password: 'Admin123!',
    icon: ShieldCheck,
    desc: 'Operations',
  },
];

const STATS = [
  { icon: Users, value: '50K+', label: 'Students placed' },
  { icon: Briefcase, value: '2.4K+', label: 'Companies' },
  { icon: TrendingUp, value: '94%', label: 'Placement rate' },
];

const TESTIMONIAL = {
  quote: '"InternHub helped me land my dream internship at Google in just 3 weeks."',
  name: 'Priya Sharma',
  role: "CS Intern @ Google · Stanford '26",
  initials: 'PS',
};

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role, loading, error } = useSelector((s) => s.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [mounted, setMounted] = useState(false);

  const from =
    location.state?.from?.pathname ||
    (role === 'RECRUITER' ? '/recruiter/dashboard' : role === 'ADMIN' ? '/admin' : '/student/dashboard');

  useEffect(() => {
    dispatch(clearAuthError());
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFillDemo = (preset) => {
    setActivePreset(preset.role);
    setFormData({ email: preset.email, password: preset.password });
    dispatch(loginUser({ email: preset.email, password: preset.password })).then((res) => {
      if (loginUser.fulfilled.match(res)) notify.success(`Signed in as ${preset.title}!`);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      notify.error('Please fill in both fields.');
      return;
    }
    const res = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(res)) notify.success('Welcome back! 👋');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left brand panel (desktop only) ── */}
      <aside
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] shrink-0 flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(255,255,255,0.18) 0%, transparent 45%),
              radial-gradient(circle at 85% 85%, rgba(99,102,241,0.35) 0%, transparent 45%)`,
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.055] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-9 xl:p-12">
          {/* Logo */}
          <BrandLogo to="/" size="md" inverted showBadge={false} />

          {/* Copy */}
          <div className="flex-1 flex flex-col justify-center mt-10">
            <div className="space-y-5 max-w-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                #1 Internship Platform in India
              </div>

              <h1 className="text-[2.1rem] xl:text-[2.5rem] font-bold text-white leading-[1.18] tracking-tight">
                Launch your<br />
                <span className="text-blue-200">career journey</span><br />
                today.
              </h1>

              <p className="text-blue-100/75 text-sm leading-relaxed">
                Connect with top companies, showcase your skills, and land the internship that
                shapes your future.
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/10 border border-white/15 p-3 text-center"
                  >
                    <Icon className="w-4 h-4 text-blue-200 mx-auto mb-1" />
                    <div className="text-base font-bold text-white">{value}</div>
                    <div className="text-[9px] text-blue-200/75 font-medium leading-tight mt-0.5">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-white/88 text-sm leading-relaxed italic">{TESTIMONIAL.quote}</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {TESTIMONIAL.initials}
              </div>
              <div>
                <div className="text-white text-xs font-semibold">{TESTIMONIAL.name}</div>
                <div className="text-blue-200/65 text-[10px]">{TESTIMONIAL.role}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex-1 min-w-0 flex flex-col items-center justify-start sm:justify-center px-4 xs:px-5 sm:px-8 py-8 sm:py-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 text-center">
          <BrandLogo to="/" size="md" />
        </div>

        <div
          className={`w-full max-w-[440px] transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Page header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to continue to your dashboard</p>
          </div>

          {/* Demo presets */}
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/60 border border-brand-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-500 shrink-0" />
                Quick Demo
              </span>
              <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                1-click login
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
              {DEMO_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isActive = activePreset === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleFillDemo(preset)}
                    disabled={loading}
                    className={`group flex flex-col items-center gap-1.5 p-2 xs:p-2.5 rounded-xl border text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive
                        ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200'
                        : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-sm hover:-translate-y-px'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-brand-100'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-600'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-bold leading-none ${
                        isActive ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {preset.title}
                    </span>
                    <span
                      className={`text-[9px] leading-tight hidden xs:block ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-slate-50 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                or use your credentials
              </span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/[0.06] overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-4 xs:p-5 sm:p-6 space-y-4">
                {error && (
                  <Alert
                    variant="danger"
                    description={error}
                    dismissible
                    onDismiss={() => dispatch(clearAuthError())}
                  />
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-0.5 group shrink-0"
                    >
                      Forgot password?
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-px transition-transform" />
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white hover:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  style={{
                    background: loading
                      ? '#64748b'
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.32)',
                  }}
                >
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-xl" />
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 xs:px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center">
                <span className="text-xs text-slate-500">Don&apos;t have an account?</span>
                <Link
                  to="/register"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Create one free →
                </Link>
              </div>
            </form>
          </div>

          {/* Back link & Copyright */}
          <div className="mt-5 text-center pb-4 sm:pb-0 space-y-2">
            <div>
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to homepage
              </Link>
            </div>
            <div className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} InternHub • Crafted by{' '}
              <a
                href="https://valluri-rahul-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                VALLURI RAHUL
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
