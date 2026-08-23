import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInternshipDetail,
  toggleSaveInternship,
} from '../internshipSlice.js';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  Modal,
  Textarea,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Laptop,
  Users,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';

export function InternshipDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selectedInternship: internship,
    isSaved,
    hasApplied,
    detailLoading: loading,
    error,
  } = useSelector((state) => state.internships);
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.student);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInternshipDetail(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      notify.info('Please sign in to save internships.');
      navigate('/login');
      return;
    }
    const result = await dispatch(toggleSaveInternship(internship._id));
    if (toggleSaveInternship.fulfilled.match(result)) {
      notify.success(
        result.payload.isSaved
          ? 'Saved to your bookmarks!'
          : 'Removed from bookmarks.'
      );
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify.success('Opportunity link copied to clipboard!');
    } catch {
      notify.info(`Opportunity link: ${window.location.href}`);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      notify.info('Please sign in to apply.');
      navigate('/login', { state: { from: { pathname: `/internships/${id}` } } });
      return;
    }

    if (role === 'RECRUITER') {
      notify.error('Recruiter accounts cannot submit internship applications.');
      return;
    }

    if (!user?.isVerified) {
      notify.warning('Please verify your email address prior to submitting applications.');
      navigate('/verify-email');
      return;
    }

    setApplyModalOpen(true);
  };

  const handleConfirmApplication = async () => {
    setSubmitting(true);
    try {
      // Application API call simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notify.success('Application submitted successfully! Track your status on Dashboard.');
      setApplyModalOpen(false);
      // Re-fetch detail to reflect application state
      dispatch(fetchInternshipDetail(id));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!internship && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <ErrorState
            title="Internship not found"
            message={error || 'The opportunity you are looking for may have expired or been removed.'}
            action={
              <Link to="/internships">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to All Internships
                </Button>
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const company = internship.companyId || {};
  const isCompanyVerified = Boolean(company.verified);

  // Format stipend
  let stipendText = 'Competitive';
  if (internship.stipend) {
    if (internship.stipend.isUnpaid) {
      stipendText = 'Unpaid';
    } else if (internship.stipend.amount) {
      const pMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendText = `$${internship.stipend.amount.toLocaleString()}${
        pMap[internship.stipend.period] || '/mo'
      }`;
    }
  }

  // Location text
  const locationText =
    typeof internship.location === 'object'
      ? `${internship.location?.city || ''}${
          internship.location?.city && internship.location?.country ? ', ' : ''
        }${internship.location?.country || ''}` || 'Remote'
      : internship.location || 'Remote';

  const daysUntilDeadline = internship.applicationDeadline
    ? Math.ceil(
        (new Date(internship.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all internships
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 shadow-card">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            {/* Company Logo & Role Title */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700/60 p-2.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-brand-400" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-300">
                    {company.name || 'Company'}
                  </span>
                  {isCompanyVerified && (
                    <Badge variant="primary" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-300" />
                      Verified Partner
                    </Badge>
                  )}
                  {company.industry && (
                    <span className="text-xs text-slate-500">• {company.industry}</span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  {internship.title}
                </h1>

                {/* Quick Metadata Bar */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {locationText}
                  </span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-brand-400" />
                    {internship.remote || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {internship.duration || '3 Months'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-white">{stipendText}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Share + Save) */}
            <div className="flex items-center gap-2 self-start shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>
              <Button
                variant={isSaved ? 'primary' : 'outline'}
                size="sm"
                onClick={handleToggleSave}
                leftIcon={
                  <Bookmark
                    className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : ''}`}
                  />
                }
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Details (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About the Role */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-base font-bold text-white">About the Internship</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            {Array.isArray(internship.responsibilities) && internship.responsibilities.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white">
                    What You Will Do (Responsibilities)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2.5">
                  {internship.responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Requirements & Qualifications */}
            {Array.isArray(internship.requirements) && internship.requirements.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white">Requirements & Qualifications</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2.5">
                  {internship.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {Array.isArray(internship.skills) && internship.skills.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white">Desired Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About Company */}
            {company.description && (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white">
                    About {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {company.description}
                  </p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                    >
                      <span>Visit Company Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sticky Application Sidebar (Right Col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="border-slate-800 bg-slate-900/90 shadow-card">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white">Application Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Deadline countdown */}
                {daysUntilDeadline !== null && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      daysUntilDeadline <= 3
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-brand-400 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-white">
                        {daysUntilDeadline > 0
                          ? `${daysUntilDeadline} days remaining`
                          : 'Deadline Today'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Applications close {new Date(internship.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info List */}
                <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Compensation:</span>
                    <span className="font-semibold text-white font-mono">{stipendText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Workplace:</span>
                    <span className="font-semibold text-white">{internship.remote || 'Remote'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commitment:</span>
                    <span className="font-semibold text-white">
                      {internship.type === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Openings:</span>
                    <span className="font-semibold text-white">{internship.openings || 1} position</span>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  {hasApplied ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                      <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Application Submitted
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Your resume has been shared with the recruiter.
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      leftIcon={<Send className="w-4 h-4" />}
                      onClick={handleApplyClick}
                    >
                      Apply Now
                    </Button>
                  )}
                  <p className="text-[11px] text-slate-500 text-center">
                    Instant 1-click submission with your verified profile
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 1-Click Application Confirmation Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to ${internship.title}`}
        description={`Submitting application to ${company.name || 'Company'}.`}
        size="md"
      >
        <div className="space-y-4 pt-2">
          {/* Active resume banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                PDF
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white truncate max-w-xs">
                  {profile?.resume?.fileName || 'Verified Profile Resume.pdf'}
                </p>
                <p className="text-[11px] text-emerald-400">Attached to application</p>
              </div>
            </div>
            <Link to="/student/resume" className="text-xs text-brand-400 hover:text-brand-300">
              Change
            </Link>
          </div>

          {/* Optional Cover Note */}
          <Textarea
            label="Cover Note to Hiring Team (Optional)"
            placeholder="Briefly describe why you are excited about this role and how your skills fit..."
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={submitting}
              loadingText="Submitting..."
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleConfirmApplication}
            >
              Confirm & Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

export default InternshipDetailPage;
