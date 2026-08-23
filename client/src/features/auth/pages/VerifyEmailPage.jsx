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
  Spinner,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const tokenFromUrl = params.token || searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = React.useCallback(async (verifyToken) => {
    const activeToken = verifyToken || token;
    if (!activeToken) {
      notify.error('Verification token is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(activeToken);
      setVerified(true);
      notify.success('Email address verified successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Verification failed. The token may have expired or is invalid.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-verify if token is present in URL on mount
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl, handleVerify]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-brand-500/20 selection:text-brand-300">
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Verify your email</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Confirm your university or business email address to unlock verified applications
          </p>
        </div>

        {/* Card */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-modal">
          {!verified ? (
            <CardContent className="space-y-5 pt-6">
              {error && (
                <Alert
                  variant="danger"
                  description={error}
                  dismissible
                  onDismiss={() => setError(null)}
                />
              )}

              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400">
                <MailCheck className="w-6 h-6" />
              </div>

              {!tokenFromUrl && (
                <Input
                  label="Verification Token"
                  placeholder="Paste your email verification token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              )}

              <Button
                variant="primary"
                fullWidth
                size="md"
                isLoading={loading}
                loadingText="Verifying..."
                onClick={() => handleVerify(token)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Verify Email Address
              </Button>
            </CardContent>
          ) : (
            <CardContent className="space-y-4 pt-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Email Verified Successfully!</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Your email has been verified. You can now submit applications and connect directly with
                hiring managers.
              </p>
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Sign In
              </Button>
            </CardContent>
          )}

          <CardFooter className="justify-center text-xs text-slate-400 border-t border-slate-800/80 bg-slate-950/40">
            <Link
              to="/login"
              className="font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
