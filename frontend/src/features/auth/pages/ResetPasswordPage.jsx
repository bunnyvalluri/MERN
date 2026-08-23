import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import authService from '../../../services/authService.js';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Alert,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { Sparkles, Lock, ArrowRight, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const tokenFromUrl = params.token || searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Real-time password validation criteria
  const passwordCriteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'One number (0-9)', met: /\d/.test(newPassword) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(newPassword) },
  ];

  const isPasswordValid = passwordCriteria.every((c) => c.met);
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      notify.error('Reset token is missing. Please check your reset link.');
      return;
    }

    if (!isPasswordValid) {
      notify.error('Please ensure your new password meets all strength requirements.');
      return;
    }

    if (!doPasswordsMatch) {
      notify.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
      notify.success('Password reset successfully! Please sign in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired or is invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-brand-500/20 selection:text-brand-300">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-brand-300 transition-colors">
              InternHub
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create new password</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter a strong, secure password for your account
          </p>
        </div>

        {/* Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-modal">
          {!success ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <Alert
                    variant="danger"
                    description={error}
                    dismissible
                    onDismiss={() => setError(null)}
                  />
                )}

                {!tokenFromUrl && (
                  <Input
                    label="Reset Token"
                    placeholder="Enter the reset token received"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new strong password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                {newPassword.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-[11px] animate-fade-in">
                    <span className="font-semibold text-slate-400 block mb-1">
                      Password Requirements:
                    </span>
                    {passwordCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${
                          crit.met ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {crit.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{crit.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={
                    confirmPassword && !doPasswordsMatch
                      ? 'Passwords do not match.'
                      : undefined
                  }
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  isLoading={loading}
                  loadingText="Updating password..."
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="mt-2"
                >
                  Reset Password
                </Button>
              </CardContent>

              <CardFooter className="justify-center text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40">
                <Link
                  to="/login"
                  className="font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 pt-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Password reset complete!</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Your password has been updated and all prior sessions have been revoked. Redirecting to
                sign in...
              </p>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => navigate('/login')}
              >
                Go to Sign In
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
