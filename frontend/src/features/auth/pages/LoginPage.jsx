import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../authSlice.js';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Alert,
  Badge,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { BrandLogo, BrandIcon } from '../../../components/common/BrandLogo.jsx';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  ArrowLeft,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    role: 'STUDENT',
    title: 'Student Portal',
    email: 'student@internhub.dev',
    password: 'Student123!',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    badgeVariant: 'primary',
    desc: 'Browse, save & 1-click apply',
  },
  {
    role: 'RECRUITER',
    title: 'Recruiter ATS',
    email: 'recruiter@stripe.com',
    password: 'Recruiter123!',
    icon: <Building2 className="w-3.5 h-3.5" />,
    badgeVariant: 'warning',
    desc: 'Post roles & review candidates',
  },
  {
    role: 'ADMIN',
    title: 'Platform Admin',
    email: 'admin@internhub.dev',
    password: 'Admin123!',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    badgeVariant: 'danger',
    desc: 'Operations & moderation feed',
  },
];

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = location.state?.from?.pathname || (role === 'RECRUITER' ? '/recruiter/dashboard' : role === 'ADMIN' ? '/admin' : '/student/dashboard');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFillDemo = (preset, autoLogin = false) => {
    setFormData({
      email: preset.email,
      password: preset.password,
    });
    notify.info(`Filled ${preset.title} demo credentials`);

    if (autoLogin) {
      dispatch(loginUser({ email: preset.email, password: preset.password })).then((res) => {
        if (loginUser.fulfilled.match(res)) {
          notify.success(`Signed in as ${preset.title}!`);
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      notify.error('Please fill in both email and password.');
      return;
    }

    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      notify.success('Signed in successfully! Welcome back.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-brand-500/20 selection:text-brand-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo to="/" size="lg" showBadge={true} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Access your applications, recruiter pipeline, or admin center
            </p>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Quick Demo Access
            </span>
            <span className="text-[11px] text-slate-500">1-click login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.role}
                type="button"
                onClick={() => handleFillDemo(preset, true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-brand-50/60 hover:border-brand-300 transition-all text-left group flex flex-col justify-between space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1">
                    {preset.icon}
                    {preset.title.split(' ')[0]}
                  </span>
                  <Badge variant={preset.badgeVariant} size="xs">
                    {preset.role}
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate block">
                  {preset.email.split('@')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 bg-white shadow-card">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <Alert
                  variant="danger"
                  description={error}
                  dismissible
                  onDismiss={() => dispatch(clearAuthError())}
                />
              )}

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="student@internhub.dev or recruiter@stripe.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={loading}
                loadingText="Signing in..."
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2"
              >
                Sign In
              </Button>
            </CardContent>

            <CardFooter className="justify-center text-xs text-slate-600 border-t border-slate-100 bg-slate-50/70">
              <span>Don&apos;t have an account?</span>
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 ml-1.5 transition-colors"
              >
                Create Account
              </Link>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Cheat Sheet Card */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white/80 text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preset Login Credentials:</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] text-slate-600">
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>🎓 student@internhub.dev</span>
              <span className="text-slate-900 font-bold">Student123!</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>🏢 recruiter@stripe.com</span>
              <span className="text-slate-900 font-bold">Recruiter123!</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>🛡️ admin@internhub.dev</span>
              <span className="text-slate-900 font-bold">Admin123!</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
