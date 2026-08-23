import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [devResetToken, setDevResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      notify.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(email);
      setSubmitted(true);
      if (response.data?.resetToken) {
        setDevResetToken(response.data.resetToken);
      }
      notify.success('Password reset instructions sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset your password</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your account email and we will send you instructions to reset your password
          </p>
        </div>

        {/* Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-modal">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <Alert variant="danger" description={error} dismissible onDismiss={() => setError(null)} />
                )}

                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="name@university.edu or name@company.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  isLoading={loading}
                  loadingText="Sending instructions..."
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Reset Link
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
            <CardContent className="space-y-5 pt-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Check your email</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  If an account exists for <span className="text-slate-200 font-semibold">{email}</span>, we
                  have sent a password reset link valid for 15 minutes.
                </p>
              </div>

              {devResetToken && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left space-y-1.5">
                  <span className="text-[11px] font-mono text-brand-400 font-semibold block">
                    Development Reset Link:
                  </span>
                  <Link
                    to={`/reset-password?token=${devResetToken}`}
                    className="text-xs font-mono text-slate-300 underline break-all hover:text-brand-300"
                  >
                    /reset-password?token={devResetToken}
                  </Link>
                </div>
              )}

              <Button
                variant="outline"
                fullWidth
                size="md"
                onClick={() => setSubmitted(false)}
              >
                Send Another Link
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
