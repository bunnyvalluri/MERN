import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitApplication } from '../../applications/applicationSlice.js';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import {
  Modal,
  Button,
  Badge,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Send,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  MapPin,
  DollarSign,
  X,
  Check,
} from 'lucide-react';

const COVER_NOTE_SUGGESTIONS = [
  'Experienced in React, TypeScript, and modern scalable web apps.',
  'Passionate about AI/ML foundation models and distributed systems.',
  'Available full-time for Summer 2026 with strong project portfolio.',
];

export function InternshipQuickApplyModal({
  isOpen,
  onClose,
  internship,
  onAppliedSuccessfully,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.student);

  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasAppliedSuccess, setHasAppliedSuccess] = useState(false);

  // Check if locally or already applied
  const isAlreadyApplied = useMemo(() => {
    if (!internship) return false;
    try {
      const raw = localStorage.getItem('internhub_student_applications');
      if (!raw) return false;
      const apps = JSON.parse(raw);
      const targetId = String(internship._id || internship.id || internship.slug);
      return apps.some(
        (a) =>
          String(a.internshipId) === targetId ||
          String(a._id) === targetId ||
          String(a.id) === targetId
      );
    } catch {
      return false;
    }
  }, [internship]);

  if (!internship) return null;

  const id = internship._id || internship.id || internship.slug;
  const company = internship.companyId || {};
  const companyName = company.name || internship.company || 'Enterprise Tech Partner';
  const companyLogo = company.logo || internship.companyLogo || null;
  const companySlug = company.slug || internship.companySlug || '';
  const companyWebsite = company.website || internship.companyWebsite || '';
  const applyUrl = internship.applyUrl || null;

  // Format stipend
  let stipendText = 'Competitive';
  if (internship.stipend) {
    if (internship.stipend.isUnpaid) {
      stipendText = 'Unpaid / Academic Credit';
    } else if (internship.stipend.amount) {
      const pMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendText = `$${internship.stipend.amount.toLocaleString()}${
        pMap[internship.stipend.period] || '/mo'
      }`;
    }
  }

  // Location
  const locationText =
    typeof internship.location === 'object'
      ? `${internship.location?.city || ''}${
          internship.location?.city && internship.location?.country ? ', ' : ''
        }${internship.location?.country || ''}` || 'Remote Global'
      : internship.location || 'Remote Global';

  const handleApply = async () => {
    if (!isAuthenticated) {
      notify.info('Please sign in to submit your 1-click application.');
      navigate('/login', { state: { from: { pathname: `/internships/${id}` } } });
      return;
    }

    if (role === 'RECRUITER') {
      notify.error('Recruiter accounts cannot submit internship applications.');
      return;
    }

    if (user && !user.isVerified) {
      notify.warning('Please verify your email address prior to submitting applications.');
      navigate('/verify-email');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        internshipId: String(id),
        internship: internship,
        coverLetter: coverLetter.trim(),
        resume: {
          url: profile?.resume?.url || 'https://internhub.dev/resumes/jordan_lee_resume.pdf',
          publicId: profile?.resume?.publicId || null,
          fileName: profile?.resume?.fileName || 'Verified_Profile_Resume_2026.pdf',
        },
      };

      const result = await dispatch(submitApplication(payload));
      if (submitApplication.fulfilled.match(result)) {
        setHasAppliedSuccess(true);
        notify.success(`Application sent to ${companyName}!`);
        onAppliedSuccessfully?.(id);
      } else {
        notify.error(result.payload || 'Failed to submit application.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setHasAppliedSuccess(false);
    setCoverLetter('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={false}
      size="lg"
      className="p-0 overflow-hidden rounded-3xl"
    >
      <div className="flex flex-col max-h-[88vh] sm:max-h-[85vh] w-full">
        {/* Custom High-Contrast Header Hero Banner */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white shrink-0">
          {/* Custom White Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-start gap-3.5 sm:gap-4 pr-8">
            <CompanyLogo
              companyName={companyName}
              slug={companySlug}
              logo={companyLogo}
              website={companyWebsite}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-2 shrink-0 border border-slate-700/50 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-none">
                  {companyName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                  <ShieldCheck className="w-3 h-3 text-brand-300" /> Verified Role
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-1 line-clamp-2 leading-snug">
                {internship.title}
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-300 mt-1.5 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">{locationText}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {stipendText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 touch-scroll">
          {/* Success State */}
          {hasAppliedSuccess || isAlreadyApplied ? (
            <div className="py-6 sm:py-8 text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Application Successfully Submitted!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your verified candidate profile and resume have been delivered directly to the hiring team at {companyName}.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/student/applications" className="w-full sm:w-auto">
                  <Button variant="primary" fullWidth size="sm" className="font-bold">
                    View My Applications
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleClose} fullWidth size="sm" className="w-full sm:w-auto">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Authenticated Student Profile Resume Preview */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 shrink-0" /> Primary Candidate Resume
                  </span>
                  {isAuthenticated && (
                    <Link
                      to="/student/resume"
                      className="text-[11px] sm:text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline shrink-0"
                    >
                      Manage
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile?.resume?.fileName || (isAuthenticated ? `${user?.name || 'Verified'}_Resume_2026.pdf` : 'Jordan_Lee_Verified_Resume.pdf')}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium truncate">
                        ✓ Ready for 1-Click Fast Track
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold shrink-0">
                    Verified
                  </span>
                </div>
              </div>

              {/* Quick Cover Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="quick-cover-note" className="text-[11px] sm:text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Note to Recruiter (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {coverLetter.length}/500
                  </span>
                </div>

                <textarea
                  id="quick-cover-note"
                  placeholder="Highlight your most relevant projects, open-source work, or excitement for this team..."
                  rows={3}
                  maxLength={500}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full bg-slate-50/70 focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 p-3 transition-all placeholder:text-slate-400 focus:outline-none resize-none shadow-2xs"
                />

                {/* Quick Prompt Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Quick Prompts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COVER_NOTE_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverLetter(suggestion)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-slate-600 transition-colors text-left font-medium max-w-full truncate"
                      >
                        "{suggestion.slice(0, 42)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Responsive Footer Actions */}
        {!hasAppliedSuccess && !isAlreadyApplied && (
          <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {applyUrl ? (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
              >
                <span>Apply on company site</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                ⚡ 100% verified direct partner application
              </span>
            )}

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handleClose}
                size="sm"
                className="w-1/3 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={submitting}
                loadingText="Submitting..."
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleApply}
                className="flex-1 sm:flex-initial font-bold shadow-xs"
              >
                Submit 1-Click Application
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default InternshipQuickApplyModal;
