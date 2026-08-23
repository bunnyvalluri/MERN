import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInternshipDetail,
  toggleSaveInternship,
} from '../internshipSlice.js';
import { fetchStudentProfile } from '../../student/studentSlice.js';
import { submitApplication } from '../../applications/applicationSlice.js';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
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
    if (isAuthenticated && role === 'STUDENT' && !profile) {
      dispatch(fetchStudentProfile());
    }
  }, [dispatch, id, isAuthenticated, role, profile]);

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
      const payload = {
        internshipId: internship._id,
        coverLetter,
      };
      if (profile?.resume?.url) {
        payload.resume = {
          url: profile.resume.url,
          publicId: profile.resume.publicId || null,
          fileName: profile.resume.fileName || 'resume.pdf',
        };
      }

      const result = await dispatch(submitApplication(payload));
      if (submitApplication.fulfilled.match(result)) {
        notify.success('Application submitted successfully! Track your status on Dashboard.');
        setApplyModalOpen(false);
        dispatch(fetchInternshipDetail(id));
      } else {
        notify.error(result.payload || 'Failed to submit application.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!internship && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
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
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
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

  /** Build JobPosting JSON-LD structured data */
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: internship.title,
    description: internship.description,
    datePosted: internship.createdAt
      ? new Date(internship.createdAt).toISOString().split('T')[0]
      : undefined,
    validThrough: internship.applicationDeadline
      ? new Date(internship.applicationDeadline).toISOString().split('T')[0]
      : undefined,
    employmentType: internship.type === 'FULL_TIME' ? 'FULL_TIME' : 'PART_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name || 'Company',
      sameAs: company.website || undefined,
      logo: company.logo || undefined,
    },
    jobLocation:
      internship.remote === 'REMOTE'
        ? { '@type': 'Place', name: 'Remote' }
        : {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality:
                typeof internship.location === 'object'
                  ? internship.location?.city
                  : locationText,
              addressCountry:
                typeof internship.location === 'object'
                  ? internship.location?.country
                  : undefined,
            },
          },
    applicantLocationRequirements:
      internship.remote === 'REMOTE'
        ? { '@type': 'Country', name: 'Anywhere' }
        : undefined,
    jobLocationType: internship.remote === 'REMOTE' ? 'TELECOMMUTE' : undefined,
    baseSalary:
      internship.stipend?.amount
        ? {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: {
              '@type': 'QuantitativeValue',
              value: internship.stipend.amount,
              unitText: internship.stipend.period === 'HOUR' ? 'HOUR' : 'MONTH',
            },
          }
        : undefined,
    skills: Array.isArray(internship.skills) ? internship.skills.join(', ') : undefined,
    url: `https://internhub.dev/internships/${id}`,
    directApply: true,
  };

  /** Dynamic page title */
  const pageTitle = `${internship.title} at ${company.name || 'Company'} — InternHub`;

  /** Dynamic description — first 155 chars of the internship description */
  const pageDescription = internship.description
    ? internship.description.slice(0, 152) + (internship.description.length > 152 ? '...' : '')
    : `Apply to ${internship.title} at ${company.name}. View responsibilities, requirements, and compensation on InternHub.`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/internships/${id}`}
        ogImage={company.logo || undefined}
        ogType="article"
        jsonLd={jobPostingJsonLd}
      />
      <Navbar />

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" aria-label={`${internship.title} at ${company.name || 'Company'}`}>
        {/* Back navigation */}
        <div>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Back to all internships"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all internships
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="p-4 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
            {/* Company Logo & Role Title */}
            <div className="flex flex-col xs:flex-row items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2 sm:p-2.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} company logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-lg"
                    loading="eager"
                  />
                ) : (
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-brand-600" />
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-600">
                    {company.name || 'Company'}
                  </span>
                  {isCompanyVerified && (
                    <Badge variant="primary" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-700" />
                      Verified Partner
                    </Badge>
                  )}
                  {company.industry && (
                    <span className="text-xs text-slate-400">• {company.industry}</span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight break-words">
                  {internship.title}
                </h1>

                {/* Quick Metadata Bar */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{locationText}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    {internship.remote || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {internship.duration || '3 Months'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <strong className="text-slate-900">{stipendText}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Share + Save) */}
            <div className="flex items-center gap-2 self-start shrink-0 pt-1 sm:pt-0">
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
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">About the Internship</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            {Array.isArray(internship.responsibilities) && internship.responsibilities.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    What You Will Do (Responsibilities)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2.5">
                  {internship.responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Requirements & Qualifications */}
            {Array.isArray(internship.requirements) && internship.requirements.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Requirements & Qualifications</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-2.5">
                  {internship.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {Array.isArray(internship.skills) && internship.skills.length > 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Desired Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
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
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    About {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {company.description}
                  </p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
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
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">Application Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Deadline countdown */}
                {daysUntilDeadline !== null && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      daysUntilDeadline <= 3
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-brand-600 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-900">
                        {daysUntilDeadline > 0
                          ? `${daysUntilDeadline} days remaining`
                          : 'Deadline Today'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Applications close {new Date(internship.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info List */}
                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Compensation:</span>
                    <span className="font-semibold text-slate-900 font-mono">{stipendText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Workplace:</span>
                    <span className="font-semibold text-slate-900">{internship.remote || 'Remote'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commitment:</span>
                    <span className="font-semibold text-slate-900">
                      {internship.type === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Openings:</span>
                    <span className="font-semibold text-slate-900">{internship.openings || 1} position</span>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {hasApplied ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                      <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Application Submitted
                      </p>
                      <p className="text-[11px] text-slate-500">
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">
                PDF
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900 truncate max-w-xs">
                  {profile?.resume?.fileName || 'Verified Profile Resume.pdf'}
                </p>
                <p className="text-[11px] text-emerald-600">Attached to application</p>
              </div>
            </div>
            <Link to="/student/resume" className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
