import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStudentApplications,
  withdrawStudentApplication,
} from '../applicationSlice.js';
import StudentNav from '../../student/components/StudentNav.jsx';
import WithdrawModal from '../components/WithdrawModal.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Pagination,
  Input,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { REAL_INTERNSHIPS } from '../../internships/data/realInternships.js';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Eye,
  Filter,
  ArrowRight,
  TrendingUp,
  Video,
  FileText,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Applications' },
  { key: 'INTERVIEW', label: 'Interview Scheduled', countKey: 'INTERVIEW' },
  { key: 'UNDER_REVIEW', label: 'Under Review', countKey: 'UNDER_REVIEW' },
  { key: 'APPLIED', label: 'Submitted', countKey: 'APPLIED' },
  { key: 'SELECTED', label: 'Offer Received', countKey: 'SELECTED' },
  { key: 'REJECTED', label: 'Archived / Rejected', countKey: 'REJECTED' },
];

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'SELECTED'];

const STAGE_LABELS = {
  APPLIED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Technical Interview',
  SELECTED: 'Offer Extended',
  REJECTED: 'Decision Made',
  WITHDRAWN: 'Withdrawn',
};

const DEFAULT_REAL_APPS = [
  {
    _id: 'app_demo_01',
    internshipId: REAL_INTERNSHIPS[0],
    companyId: REAL_INTERNSHIPS[0].companyId,
    status: 'INTERVIEW',
    createdAt: '2026-08-18T14:30:00.000Z',
    nextAction: 'Technical screen scheduled for Friday, Aug 28 at 2:00 PM PST',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    coverLetter: 'Excited to apply for the Core Payments SWE internship at Stripe...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted successfully', changedAt: '2026-08-18T14:30:00.000Z' },
      { status: 'UNDER_REVIEW', note: 'Recruiter screened profile & resume', changedAt: '2026-08-19T09:00:00.000Z' },
      { status: 'INTERVIEW', note: 'Technical screen scheduled with payments lead', changedAt: '2026-08-20T11:00:00.000Z' },
    ],
  },
  {
    _id: 'app_demo_02',
    internshipId: REAL_INTERNSHIPS[4],
    companyId: REAL_INTERNSHIPS[4].companyId,
    status: 'UNDER_REVIEW',
    createdAt: '2026-08-19T16:00:00.000Z',
    nextAction: 'Research engineers reviewing code sample & ML portfolio',
    coverLetter: 'Passionate about AI safety evaluations and scalable oversight...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted', changedAt: '2026-08-19T16:00:00.000Z' },
      { status: 'UNDER_REVIEW', note: 'Research team reviewing technical portfolio', changedAt: '2026-08-20T10:00:00.000Z' },
    ],
  },
  {
    _id: 'app_demo_03',
    internshipId: REAL_INTERNSHIPS[7],
    companyId: REAL_INTERNSHIPS[7].companyId,
    status: 'APPLIED',
    createdAt: '2026-08-21T18:00:00.000Z',
    nextAction: 'In queue for initial engineering manager screening',
    coverLetter: 'Fascinated by WebGL graphics pipelines and WebAssembly rendering...',
    timeline: [
      { status: 'APPLIED', note: 'Application submitted', changedAt: '2026-08-21T18:00:00.000Z' },
    ],
  },
];

export function StudentApplicationsPage() {
  const dispatch = useDispatch();
  const { studentApplications, loading, actionLoading } = useSelector(
    (state) => state.applications
  );

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawTargetId, setWithdrawTargetId] = useState(null);

  useEffect(() => {
    dispatch(
      fetchStudentApplications({
        status: selectedStatus,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, selectedStatus, currentPage]);

  const rawList = (studentApplications?.data && studentApplications.data.length > 0)
    ? studentApplications.data
    : DEFAULT_REAL_APPS;

  // Filter & Search
  const filteredApps = useMemo(() => {
    let list = [...rawList];

    if (selectedStatus !== 'ALL') {
      list = list.filter((a) => a.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.internshipId?.title?.toLowerCase().includes(q) ||
          a.companyId?.name?.toLowerCase().includes(q) ||
          a.status?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'stipend') {
      list.sort(
        (a, b) =>
          (b.internshipId?.stipend?.amount || 0) - (a.internshipId?.stipend?.amount || 0)
      );
    } else {
      // latest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [rawList, selectedStatus, searchQuery, sortBy]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleConfirmWithdraw = async (note) => {
    if (!withdrawTargetId) return;
    const result = await dispatch(
      withdrawStudentApplication({ id: withdrawTargetId, note })
    );

    if (withdrawStudentApplication.fulfilled.match(result)) {
      notify.success('Application withdrawn successfully.');
      setWithdrawTargetId(null);
      dispatch(fetchStudentApplications({ status: selectedStatus, page: currentPage, limit: 10 }));
    } else {
      notify.error(result.payload || 'Failed to withdraw application.');
    }
  };

  const getStageIndex = (status) => {
    if (status === 'APPLIED') return 0;
    if (status === 'UNDER_REVIEW' || status === 'SHORTLISTED') return 1;
    if (status === 'INTERVIEW') return 2;
    if (status === 'SELECTED') return 3;
    return 0;
  };

  // Counts for status tabs
  const counts = useMemo(() => {
    const map = { ALL: rawList.length, INTERVIEW: 0, UNDER_REVIEW: 0, APPLIED: 0, SELECTED: 0, REJECTED: 0 };
    rawList.forEach((a) => {
      if (map[a.status] !== undefined) {
        map[a.status] += 1;
      }
    });
    return map;
  }, [rawList]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-100/40 via-indigo-50/30 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Application Tracking Workspace
                </h1>
                <Badge variant="primary" size="sm" className="font-mono font-bold">
                  {rawList.length} Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Monitor real-time recruiter screening milestones, technical interview schedules, and official offer decisions.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/student/interviews">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Calendar className="w-4 h-4 text-slate-600" />}
                  className="bg-white hover:bg-slate-50"
                >
                  Interview Calendar
                </Button>
              </Link>
              <Link to="/internships">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-sm"
                >
                  Apply to More Roles
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="space-y-3">
          {/* Status Tabs Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const count = counts[tab.key] || 0;
              const isActive = selectedStatus === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-xs ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Sort Sub-Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by company, role title, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
              <span className="font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="latest">Latest Applied</option>
                <option value="oldest">Earliest Applied</option>
                <option value="stipend">Highest Stipend</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <Card className="border-slate-200 bg-white py-12 shadow-sm">
            <CardContent>
              <EmptyState
                icon={<Briefcase className="w-12 h-12 text-slate-400 mx-auto" />}
                title={
                  searchQuery
                    ? `No applications matching "${searchQuery}"`
                    : selectedStatus === 'ALL'
                    ? 'No applications submitted yet'
                    : `No applications currently in "${STAGE_LABELS[selectedStatus] || selectedStatus}"`
                }
                description="Explore verified engineering internships at Stripe, Google, OpenAI, Apple, and Figma."
                action={
                  <div className="flex items-center gap-3 justify-center pt-2">
                    {searchQuery && (
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    )}
                    <Link to="/internships">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Browse Internships
                      </Button>
                    </Link>
                  </div>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const internship = app.internshipId || {};
              const company = app.companyId || {};
              const canWithdraw = !['WITHDRAWN', 'REJECTED', 'SELECTED'].includes(app.status);
              const currentStageIdx = getStageIndex(app.status);

              // Format stipend
              let stipendText = '$9,200/mo';
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
                <div
                  key={app._id}
                  className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm group space-y-4"
                >
                  {/* Top Row: Company, Role & Main Badges */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          company.logo ||
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={company.name || 'Company'}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 p-1 bg-white shadow-xs shrink-0"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800">
                            {company.name || 'Tech Corp'}
                          </span>
                          {company.verified && (
                            <Badge variant="primary" size="xs">
                              Verified Employer
                            </Badge>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          to={`/student/applications/${app._id}`}
                          className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors inline-block"
                        >
                          {internship.title || 'Software Engineering Intern'}
                        </Link>

                        {/* Metadata pills */}
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 pt-0.5 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {internship.remote || 'Remote / Hybrid'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {internship.duration || 'Summer 2026'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-bold text-emerald-700">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            {stipendText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Current Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Badge
                        variant={
                          app.status === 'SELECTED'
                            ? 'success'
                            : app.status === 'INTERVIEW'
                            ? 'warning'
                            : app.status === 'SHORTLISTED'
                            ? 'info'
                            : app.status === 'REJECTED'
                            ? 'danger'
                            : 'primary'
                        }
                        size="md"
                        className="font-bold uppercase tracking-wider text-xs px-3 py-1"
                      >
                        {STAGE_LABELS[app.status] || app.status.replace('_', ' ')}
                      </Badge>

                      {canWithdraw && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setWithdrawTargetId(app._id)}
                          className="text-slate-400 hover:text-rose-600 text-xs"
                        >
                          Withdraw
                        </Button>
                      )}

                      <Link to={`/student/applications/${app._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          className="bg-white hover:bg-slate-50 text-xs font-semibold"
                        >
                          Full Timeline
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Visual 4-Step Pipeline Stepper */}
                  <div className="pt-2 pb-1 border-t border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {['Submitted', 'Under Review', 'Interview', 'Decision'].map((stepLabel, sIdx) => {
                        const isPast = sIdx < currentStageIdx;
                        const isCurrent = sIdx === currentStageIdx;

                        return (
                          <div key={sIdx} className="space-y-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                isPast
                                  ? 'bg-emerald-500'
                                  : isCurrent
                                  ? app.status === 'REJECTED'
                                    ? 'bg-rose-500'
                                    : 'bg-brand-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold block truncate ${
                                isCurrent
                                  ? 'text-brand-600'
                                  : isPast
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Step / Callout Note */}
                  {app.nextAction && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        {app.status === 'INTERVIEW' ? (
                          <Video className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-900">Next Step:</span>
                        <span className="text-slate-600">{app.nextAction}</span>
                      </div>

                      {app.meetingLink && (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 shrink-0"
                        >
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={Boolean(withdrawTargetId)}
        onClose={() => setWithdrawTargetId(null)}
        onConfirm={handleConfirmWithdraw}
        isSubmitting={actionLoading}
      />
    </div>
  );
}

export default StudentApplicationsPage;
