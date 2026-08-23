import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudentApplicationDetail,
  withdrawStudentApplication,
} from '../applicationSlice.js';
import StudentNav from '../../student/components/StudentNav.jsx';
import ApplicationTimeline from '../components/ApplicationTimeline.jsx';
import WithdrawModal from '../components/WithdrawModal.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  ErrorState,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  Video,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

const STATUS_BADGE_VARIANTS = {
  APPLIED: 'primary',
  UNDER_REVIEW: 'secondary',
  SHORTLISTED: 'warning',
  INTERVIEW: 'info',
  SELECTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function StudentApplicationDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    studentApplicationDetail: application,
    studentInterview: interview,
    detailLoading: loading,
    actionLoading,
    error,
  } = useSelector((state) => state.applications);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentApplicationDetail(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  const handleConfirmWithdraw = async (note) => {
    const result = await dispatch(
      withdrawStudentApplication({ id: application._id, note })
    );

    if (withdrawStudentApplication.fulfilled.match(result)) {
      notify.success('Application withdrawn successfully.');
      setWithdrawModalOpen(false);
      dispatch(fetchStudentApplicationDetail(id));
    } else {
      notify.error(result.payload || 'Failed to withdraw application.');
    }
  };

  if (loading || (!application && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <StudentNav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <StudentNav />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <ErrorState
            title="Application not found"
            message={error || 'The application you are trying to view does not exist or you do not have permission.'}
            action={
              <Link to="/student/applications">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to My Applications
                </Button>
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  const internship = application.internshipId || {};
  const company = application.companyId || {};
  const badgeVariant = STATUS_BADGE_VARIANTS[application.status] || 'neutral';
  const canWithdraw = !['WITHDRAWN', 'REJECTED', 'SELECTED'].includes(application.status);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <StudentNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            to="/student/applications"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all my applications
          </Link>
        </div>

        {/* Application Header Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 shadow-card">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
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
                  {company.verified && (
                    <Badge variant="primary" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-300" />
                      Verified Partner
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500">
                    • Applied {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  {internship.title || 'Internship Role'}
                </h1>

                {/* Quick Metadata Bar */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {internship.remote || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {internship.duration || '3 Months'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-slate-200">{stipendText}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Current Status Badge & Top Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 self-start shrink-0">
              <Badge variant={badgeVariant} size="lg" className="px-3.5 py-1 text-xs sm:text-sm">
                {application.status.replace('_', ' ')}
              </Badge>

              <div className="flex items-center gap-2">
                {canWithdraw && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawModalOpen(true)}
                    className="text-slate-300 hover:text-red-400 hover:border-red-500/30"
                  >
                    Withdraw Application
                  </Button>
                )}
                {internship._id && (
                  <Link to={`/internships/${internship._id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                      View Listing
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Interview Callout Banner (If active) */}
        {interview && interview.status === 'SCHEDULED' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-teal-900/20 to-slate-900 border border-teal-500/40 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider border border-teal-500/30">
                    Interview Scheduled
                  </span>
                  <span className="text-xs text-slate-400">
                    Duration: {interview.durationMinutes || 45} mins ({interview.type})
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-400" />
                  {new Date(interview.scheduledAt).toLocaleString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </h2>
              </div>

              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-teal-600 hover:bg-teal-500 text-white"
                    leftIcon={<Video className="w-4 h-4" />}
                  >
                    Join Video Call
                  </Button>
                </a>
              )}
            </div>

            {interview.notes && (
              <p className="text-xs text-teal-200/80 bg-teal-950/60 p-3 rounded-xl border border-teal-800/40 leading-relaxed">
                <strong>Preparation Note:</strong> {interview.notes}
              </p>
            )}

            {interview.interviewer?.name && (
              <p className="text-xs text-slate-400">
                Interviewer: <strong className="text-slate-200">{interview.interviewer.name}</strong>{' '}
                {interview.interviewer.email && `(${interview.interviewer.email})`}
              </p>
            )}
          </div>
        )}

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Details (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Progress Timeline Card */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  Application Progress Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ApplicationTimeline timeline={application.timeline || []} />
              </CardContent>
            </Card>

            {/* Submitted Application Assets */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  Submitted Application Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Resume Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-sm">
                        {application.resume?.fileName || 'Attached Resume.pdf'}
                      </p>
                      <p className="text-[11px] text-emerald-400">Verified resume submitted to hiring team</p>
                    </div>
                  </div>

                  {application.resume?.url && (
                    <a
                      href={application.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Document
                      </Button>
                    </a>
                  )}
                </div>

                {/* Cover Letter */}
                {application.coverLetter ? (
                  <div className="space-y-1.5 pt-2">
                    <h3 className="text-xs font-semibold text-slate-300">Cover Note to Recruiter:</h3>
                    <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
                      {application.coverLetter}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No custom cover note was attached.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Internship Overview */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 shadow-card">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-white">Internship Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-semibold text-white truncate max-w-[160px]">
                      {internship.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-semibold text-white">{company.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compensation:</span>
                    <span className="font-semibold text-white font-mono">{stipendText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Workplace:</span>
                    <span className="font-semibold text-white">{internship.remote || 'Remote'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-semibold text-white">{internship.duration || '3 Months'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commitment:</span>
                    <span className="font-semibold text-white">
                      {internship.type === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                    </span>
                  </div>
                </div>

                {internship.skills && internship.skills.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-400">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {internship.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 rounded bg-brand-500/10 border border-brand-500/20 text-[11px] font-semibold text-brand-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {canWithdraw && (
                  <div className="pt-4 border-t border-slate-800">
                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                      onClick={() => setWithdrawModalOpen(true)}
                      className="text-red-400 hover:bg-red-500/10 border-red-500/20"
                    >
                      Withdraw Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Withdraw Confirmation Modal */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onConfirm={handleConfirmWithdraw}
        isSubmitting={actionLoading}
      />
    </div>
  );
}

export default StudentApplicationDetailPage;
