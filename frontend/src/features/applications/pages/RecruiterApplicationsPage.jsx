import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecruiterApplications,
  updateCandidateStatus,
} from '../applicationSlice.js';
import { fetchRecruiterInternships } from '../../recruiter/recruiterSlice.js';
import RecruiterNav from '../../recruiter/components/RecruiterNav.jsx';
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
  Select,
  Avatar,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Users,
  Briefcase,
  Search,
  Filter,
  Eye,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Candidates' },
  { key: 'APPLIED', label: 'New Applied' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'SELECTED', label: 'Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE_VARIANTS = {
  APPLIED: 'primary',
  UNDER_REVIEW: 'secondary',
  SHORTLISTED: 'warning',
  INTERVIEW: 'info',
  SELECTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function RecruiterApplicationsPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { recruiterApplications, loading } = useSelector(
    (state) => state.applications
  );
  const { internships: recruiterListings } = useSelector((state) => state.recruiter);

  const initialStatus = searchParams.get('status') || 'ALL';
  const initialInternshipId = searchParams.get('internshipId') || '';

  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedInternshipId, setSelectedInternshipId] = useState(initialInternshipId);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRecruiterInternships({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchRecruiterApplications({
        status: selectedStatus,
        internshipId: selectedInternshipId,
        search: searchQuery,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, selectedStatus, selectedInternshipId, searchQuery, currentPage]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleQuickStatusUpdate = async (applicationId, newStatus) => {
    const result = await dispatch(
      updateCandidateStatus({
        id: applicationId,
        status: newStatus,
        note: `Status updated to ${newStatus.replace('_', ' ')} via quick actions`,
      })
    );

    if (updateCandidateStatus.fulfilled.match(result)) {
      notify.success(`Candidate marked as ${newStatus.replace('_', ' ')}.`);
    } else {
      notify.error(result.payload || 'Failed to update status.');
    }
  };

  const applications = recruiterApplications?.data || [];
  const totalPages = recruiterApplications?.totalPages || 1;
  const stats = recruiterApplications?.stats || {
    total: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  };

  const internshipOptions = [
    { value: '', label: 'All Internship Postings' },
    ...(recruiterListings || []).map((i) => ({
      value: i._id,
      label: `${i.title} (${i.applicationsCount || 0} applicants)`,
    })),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <RecruiterNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Candidate Applications
              </h1>
              <Badge variant="primary" size="sm">
                {stats.total} Total Applicants
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Review student profiles, shortlist top talent, schedule technical interviews, and make offers.
            </p>
          </div>

          <Link to="/recruiter/internships/new">
            <Button variant="primary" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              Post New Internship
            </Button>
          </Link>
        </div>

        {/* Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Total Applicants</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
            <p className="text-[11px] text-blue-400 font-medium">New Applied</p>
            <p className="text-xl font-bold text-blue-300">{stats.applied}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
            <p className="text-[11px] text-purple-400 font-medium">Under Review</p>
            <p className="text-xl font-bold text-purple-300">{stats.underReview}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <p className="text-[11px] text-amber-400 font-medium">Shortlisted</p>
            <p className="text-xl font-bold text-amber-300">{stats.shortlisted}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-1">
            <p className="text-[11px] text-teal-400 font-medium">Interviewing</p>
            <p className="text-xl font-bold text-teal-300">{stats.interview}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <p className="text-[11px] text-emerald-400 font-medium">Accepted</p>
            <p className="text-xl font-bold text-emerald-300">{stats.selected}</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search candidates by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                options={internshipOptions}
                value={selectedInternshipId}
                onChange={(e) => {
                  setSelectedInternshipId(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatus === tab.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Applicant Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/60 py-12">
            <CardContent>
              <EmptyState
                icon={<Users className="w-12 h-12 text-slate-600 mx-auto" />}
                title={
                  selectedStatus === 'ALL'
                    ? 'No candidates found'
                    : `No candidates with status "${selectedStatus.replace('_', ' ')}"`
                }
                description="When students apply to your internship listings, their profiles and verified resumes will appear here."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {applications.map((app) => {
              const student = app.studentId || {};
              const internship = app.internshipId || {};
              const badgeVariant = STATUS_BADGE_VARIANTS[app.status] || 'neutral';

              return (
                <div
                  key={app._id}
                  className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-card group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Candidate Identity */}
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        name={student.name || 'Applicant'}
                        src={student.avatar}
                        size="md"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/recruiter/applications/${app._id}`}
                            className="text-base font-bold text-white hover:text-brand-300 transition-colors"
                          >
                            {student.name || 'Anonymous Student'}
                          </Link>
                          {student.isVerified && (
                            <Badge variant="success" size="xs">
                              Verified
                            </Badge>
                          )}
                          <Badge variant={badgeVariant} size="sm">
                            {app.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-400 font-mono">
                          {student.email}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-brand-300 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                            {internship.title || 'Internship'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Review Actions & Link */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* Quick Status Buttons */}
                      {app.status === 'APPLIED' && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuickStatusUpdate(app._id, 'UNDER_REVIEW')}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-purple-400" />}
                        >
                          Mark Review
                        </Button>
                      )}

                      {['APPLIED', 'UNDER_REVIEW'].includes(app.status) && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuickStatusUpdate(app._id, 'SHORTLISTED')}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                        >
                          Shortlist
                        </Button>
                      )}

                      {app.status === 'SHORTLISTED' && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuickStatusUpdate(app._id, 'SELECTED')}
                          leftIcon={<UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        >
                          Accept
                        </Button>
                      )}

                      {app.resume?.url && (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="xs">
                            Resume
                          </Button>
                        </a>
                      )}

                      <Link to={`/recruiter/applications/${app._id}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          Candidate Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default RecruiterApplicationsPage;
