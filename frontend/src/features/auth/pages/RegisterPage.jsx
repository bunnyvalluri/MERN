import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../authSlice.js';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Alert,
  Checkbox,
  Badge,
} from '../../../components/ui/index.js';
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
  ArrowLeft,
} from 'lucide-react';

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, role, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    agreedToTerms: false,
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'RECRUITER' ? '/recruiter/dashboard' : '/student/dashboard', {
        replace: true,
      });
    }
  }, [isAuthenticated, role, navigate]);

  // Real-time password validation indicators
  const passwordCriteria = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(formData.password) },
    { label: 'One number (0-9)', met: /\d/.test(formData.password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(formData.password) },
  ];

  const isPasswordValid = passwordCriteria.every((c) => c.met);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      notify.error('Please fill in all required fields.');
      return;
    }

    if (!isPasswordValid) {
      notify.error('Please ensure your password meets all strength requirements.');
      return;
    }

    if (!formData.agreedToTerms) {
      notify.error('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      notify.success('Account created! Welcome to InternHub.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-brand-500/20 selection:text-brand-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo to="/" size="lg" showBadge={true} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join thousands of students and hiring teams building the future of tech internships
            </p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border-slate-200 bg-white shadow-card">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6">
              {error && (
                <Alert
                  variant="danger"
                  description={error}
                  dismissible
                  onDismiss={() => dispatch(clearAuthError())}
                />
              )}

              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">I am joining as a:</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'STUDENT' }))}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      formData.role === 'STUDENT'
                        ? 'bg-brand-600 border-brand-600 text-white ring-1 ring-brand-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="truncate">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: 'RECRUITER' }))}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      formData.role === 'RECRUITER'
                        ? 'bg-brand-600 border-brand-600 text-white ring-1 ring-brand-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">Recruiter</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <Input
                label="Full Name"
                name="name"
                placeholder={formData.role === 'STUDENT' ? 'Sarah Jenkins' : 'Alex Rivera'}
                leftIcon={<User className="w-4 h-4" />}
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />

              {/* Email Address */}
              <Input
                label={formData.role === 'STUDENT' ? 'University / Personal Email' : 'Work Email'}
                type="email"
                name="email"
                placeholder={formData.role === 'STUDENT' ? 'sarah.j@stanford.edu' : 'alex@company.com'}
                leftIcon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                helperText={
                  formData.role === 'STUDENT'
                    ? 'Use your university .edu email for instant student verification.'
                    : 'Use your corporate domain email.'
                }
              />

              {/* Password */}
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />

                {/* Password Criteria List */}
                {formData.password.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-[11px] animate-fade-in">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Password Requirements:
                    </span>
                    {passwordCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${
                          crit.met ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {crit.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        )}
                        <span>{crit.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <Checkbox
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                label="I agree to the Terms of Service and Privacy Policy"
                description="We take your privacy seriously and never share applicant data with unverified parties."
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                isLoading={loading}
                loadingText="Creating account..."
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create {formData.role === 'STUDENT' ? 'Student' : 'Recruiter'} Profile
              </Button>
            </CardContent>

            <CardFooter className="justify-center text-xs text-slate-600 border-t border-slate-100 bg-slate-50/70">
              <span>Already have an account?</span>
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 ml-1.5 transition-colors"
              >
                Sign In
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

export default RegisterPage;
