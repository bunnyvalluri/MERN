import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../authSlice.js';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { Sparkles, ArrowRight, Lock, Mail, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, role, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = location.state?.from?.pathname || (role === 'RECRUITER' ? '/recruiter/dashboard' : '/student/dashboard');

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
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              InternHub
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Access your applications, interviews, and verified career profile
          </p>
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
                placeholder="name@university.edu or name@company.com"
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
