import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../authSlice.js';
import { Alert } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { BrandLogo } from '../../../components/common/BrandLogo.jsx';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const STATS = [
  { icon: Users, value: '50K+', label: 'Students placed' },
  { icon: Briefcase, value: '2.4K+', label: 'Companies' },
  { icon: TrendingUp, value: '94%', label: 'Placement rate' },
];

const BENEFITS_STUDENT = [
  { icon: Zap, text: 'AI-matched recommendations' },
  { icon: Briefcase, text: '1-click apply with your profile' },
  { icon: TrendingUp, text: 'Track all applications' },
  { icon: ShieldCheck, text: 'Verified company listings only' },
];

const BENEFITS_RECRUITER = [
  { icon: Zap, text: 'Post roles in under 2 minutes' },
  { icon: Users, text: 'AI-filtered candidate pipeline' },
  { icon: TrendingUp, text: 'Real-time application analytics' },
  { icon: ShieldCheck, text: 'Background-verified profiles' },
];

const passwordCriteriaConfig = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase (a–z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0–9)', test: (p) => /\d/.test(p) },
  { label: 'One special char (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
];

const STRENGTH_COLORS = ['', 'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_TEXT   = ['', 'text-rose-600', 'text-orange-600', 'text-amber-600', 'text-blue-600', 'text-emerald-600'];

function PasswordStrengthBar({ password }) {
  const strength = password ? passwordCriteriaConfig.filter((c) => c.test(password)).length : 0;
  if (!password) return null;
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              strength >= i ? STRENGTH_COLORS[i] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${STRENGTH_TEXT[strength]}`}>
        {STRENGTH_LABELS[strength]}
      </p>
    </div>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, role, loading, error } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [mounted, setMounted] = useState(false);

  const passwordCriteria = passwordCriteriaConfig.map((c) => ({ ...c, met: c.test(formData.password) }));
  const isPasswordValid = passwordCriteria.every((c) => c.met);
  const isStudent = formData.role === 'STUDENT';
  const benefits = isStudent ? BENEFITS_STUDENT : BENEFITS_RECRUITER;

  useEffect(() => {
    dispatch(clearAuthError());
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'RECRUITER' ? '/recruiter/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      notify.error('Please fill in all required fields.');
      return;
    }
    if (!isPasswordValid) {
      notify.error('Password does not meet requirements.');
      return;
    }
    if (!formData.agreedToTerms) {
      notify.error('You must agree to the Terms & Privacy Policy.');
      return;
    }
    const res = await dispatch(
      registerUser({ name: formData.name, email: formData.email, password: formData.password, role: formData.role })
    );
    if (registerUser.fulfilled.match(res)) notify.success('Account created! Welcome to InternHub 🎉');
  };

  const panelBg = isStudent
    ? 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)'
    : 'linear-gradient(145deg, #92400e 0%, #b45309 40%, #d97706 70%, #f59e0b 100%)';

  const btnStyle = {
    background: loading ? '#64748b' : isStudent
      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
      : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    boxShadow: loading ? 'none' : isStudent
      ? '0 4px 14px rgba(37,99,235,0.32)'
      : '0 4px 14px rgba(217,119,6,0.32)',
    transition: 'background 0.4s, box-shadow 0.4s',
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left brand panel (desktop) ── */}
      <aside
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] shrink-0 flex-col relative overflow-hidden"
        style={{ background: panelBg, transition: 'background 0.6s ease' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(255,255,255,0.18) 0%, transparent 45%),
              radial-gradient(circle at 85% 85%, rgba(99,102,241,0.3) 0%, transparent 45%)`,
          }}
        />
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
          <BrandLogo to="/" size="md" inverted showBadge={false} />

          <div className="flex-1 flex flex-col justify-center mt-10">
            <div className="space-y-5 max-w-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                {isStudent ? 'Join 50K+ students' : 'Hire top talent'}
              </div>

              <h1 className="text-[2.1rem] xl:text-[2.5rem] font-bold text-white leading-[1.18] tracking-tight">
                {isStudent ? (
                  <>Your dream<br /><span className="text-blue-200">internship</span><br />awaits.</>
                ) : (
                  <>Find your<br /><span className="text-yellow-200">next great</span><br />intern.</>
                )}
              </h1>

              <p className="text-white/70 text-sm leading-relaxed">
                {isStudent
                  ? 'Join thousands of students who found their dream internships through InternHub.'
                  : 'Access 50,000+ pre-verified students from top universities across India.'}
              </p>

              <div className="space-y-2 pt-1">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-white/90" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
                <Icon className="w-4 h-4 text-white/60 mx-auto mb-1" />
                <div className="text-base font-bold text-white">{value}</div>
                <div className="text-[9px] text-white/60 font-medium leading-tight mt-0.5">{label}</div>
              </div>
            ))}
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
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-slate-500 text-sm mt-1">Free forever · No credit card required</p>
          </div>

          {/* Role toggle — pill segmented control */}
          <div className="mb-5 p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1">
            {[
              { value: 'STUDENT', label: 'Student', icon: GraduationCap },
              { value: 'RECRUITER', label: 'Recruiter', icon: Building2 },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, role: value }))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  formData.role === value
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/[0.06] overflow-hidden">
            <form onSubmit={handleSubmit} noValidate>
              <div className="p-4 xs:p-5 sm:p-6 space-y-4">
                {error && (
                  <Alert
                    variant="danger"
                    description={error}
                    dismissible
                    onDismiss={() => dispatch(clearAuthError())}
                  />
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={isStudent ? 'Sarah Jenkins' : 'Alex Rivera'}
                      required
                      autoComplete="name"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                    {isStudent ? 'University / Personal Email' : 'Work Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isStudent ? 'sarah@stanford.edu' : 'alex@company.com'}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white hover:border-slate-300"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pl-1 leading-normal">
                    {isStudent
                      ? 'Use a .edu email for faster student verification'
                      : 'Use your corporate domain email'}
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setShowCriteria(true)}
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
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

                  {/* Strength bar */}
                  <PasswordStrengthBar password={formData.password} />

                  {/* Criteria checklist — only on focus + has input */}
                  {showCriteria && formData.password.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fade-in">
                      {passwordCriteria.map((crit, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 text-[11px] transition-colors ${
                            crit.met ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {crit.met
                            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                            : <XCircle className="w-3.5 h-3.5 shrink-0" />
                          }
                          {crit.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border-2 border-slate-300 peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all flex items-center justify-center group-hover:border-brand-400">
                      {formData.agreedToTerms && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-brand-600 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-brand-600 font-semibold hover:underline">Privacy Policy</a>.
                    We never share your data with unverified parties.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  style={btnStyle}
                >
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-xl" />
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create {isStudent ? 'Student' : 'Recruiter'} Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 xs:px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center">
                <span className="text-xs text-slate-500">Already have an account?</span>
                <Link
                  to="/login"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Sign in →
                </Link>
              </div>
            </form>
          </div>

          {/* Back link */}
          <div className="mt-5 text-center pb-4 sm:pb-0">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
