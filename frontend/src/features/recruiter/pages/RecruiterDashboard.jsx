import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardAnalytics,
  fetchRecruiterInternships,
  fetchRecruiterInterviews,
  fetchRecruiterNotifications,
  markNotificationRead,
  fetchCompanyProfile,
  updateCompanyProfile,
  publishInternship,
  unpublishInternship,
  closeInternship,
} from '../recruiterSlice.js';
import {
  fetchRecruiterApplications,
  updateCandidateStatus,
} from '../../applications/applicationSlice.js';
import {
  rescheduleInterview,
  cancelInterview,
} from '../../interviews/interviewSlice.js';
import CalendarView from '../../interviews/components/CalendarView.jsx';
import RescheduleInterviewModal from '../../interviews/components/RescheduleInterviewModal.jsx';
import CancelInterviewModal from '../../interviews/components/CancelInterviewModal.jsx';
import NotificationBell from '../../notifications/components/NotificationBell.jsx';
import { logoutUser } from '../../auth/authSlice.js';
import RecruiterSidebar from '../components/RecruiterSidebar.jsx';
import {
  WeeklyApplicationsChart,
  InternshipBreakdownChart,
  StatusDistributionChart,
} from '../components/AnalyticsCharts.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  ErrorState,
  Input,
  Textarea,
  Select,
  Avatar,
  Switch,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Bell,
  Settings,
  PlusCircle,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  LogOut,
  Video,
  Search,
  Download,
  ShieldCheck,
  ChevronRight,
  Filter,
  Save,
} from 'lucide-react';

export function RecruiterDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSection = searchParams.get('tab') || 'overview';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const {
    metrics,
    analytics,
    company,
    internships,
    interviews,
    notifications,
    unreadNotifsCount,
    recentApplications,
    upcomingInterviews,
    analyticsLoading,
    saving,
    error,
  } = useSelector((state) => state.recruiter);

  const { recruiterApplications } = useSelector((state) => state.applications);

  // Section-specific states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    companySize: '11-50',
    website: '',
    location: '',
    description: '',
    logo: '',
  });

  const [internshipFilterStatus, setInternshipFilterStatus] = useState('ALL');

  // Interview Management Modal states
  const [interviewViewMode, setInterviewViewMode] = useState('list');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewActionLoading, setInterviewActionLoading] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchCompanyProfile());
    dispatch(fetchRecruiterInternships({ limit: 50 }));
    dispatch(fetchRecruiterInterviews());
    dispatch(fetchRecruiterNotifications());
    dispatch(fetchRecruiterApplications({ limit: 20 }));
  }, [dispatch]);

  // Sync company data to form
  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        industry: company.industry || '',
        companySize: company.companySize || '11-50',
        website: company.website || '',
        location: company.location || '',
        description: company.description || '',
        logo: company.logo || '',
      });
    }
  }, [company]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionId });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateCompanyProfile(companyForm));
    if (updateCompanyProfile.fulfilled.match(result)) {
      notify.success('Company profile updated successfully.');
    } else {
      notify.error(result.payload || 'Failed to update company profile.');
    }
  };

  // Interview Actions
  const handleOpenReschedule = (intItem) => {
    setSelectedInterview(intItem);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async ({ id, data }) => {
    setInterviewActionLoading(true);
    const result = await dispatch(rescheduleInterview({ id, data }));
    setInterviewActionLoading(false);

    if (rescheduleInterview.fulfilled.match(result)) {
      notify.success('Interview rescheduled successfully!');
      setRescheduleModalOpen(false);
      setSelectedInterview(null);
      dispatch(fetchDashboardAnalytics());
      dispatch(fetchRecruiterInterviews());
    } else {
      notify.error(result.payload || 'Failed to reschedule interview.');
    }
  };

  const handleOpenCancel = (intItem) => {
    setSelectedInterview(intItem);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async ({ id, reason }) => {
    setInterviewActionLoading(true);
    const result = await dispatch(cancelInterview({ id, reason }));
    setInterviewActionLoading(false);

    if (cancelInterview.fulfilled.match(result)) {
      notify.info('Interview cancelled.');
      setCancelModalOpen(false);
      setSelectedInterview(null);
      dispatch(fetchDashboardAnalytics());
      dispatch(fetchRecruiterInterviews());
    } else {
      notify.error(result.payload || 'Failed to cancel interview.');
    }
  };

  const handleTogglePublish = async (item) => {
    if (item.status === 'PUBLISHED') {
      const result = await dispatch(unpublishInternship(item._id));
      if (unpublishInternship.fulfilled.match(result)) {
        notify.info('Internship reverted to draft.');
        dispatch(fetchDashboardAnalytics());
      }
    } else {
      const result = await dispatch(publishInternship(item._id));
      if (publishInternship.fulfilled.match(result)) {
        notify.success('Internship published successfully!');
        dispatch(fetchDashboardAnalytics());
      } else {
        notify.error(result.payload || 'Failed to publish internship.');
      }
    }
  };

  const handleClosePosting = async (id) => {
    const result = await dispatch(closeInternship(id));
    if (closeInternship.fulfilled.match(result)) {
      notify.success('Internship closed.');
      dispatch(fetchDashboardAnalytics());
    }
  };

  const handleQuickStatus = async (appId, newStatus) => {
    const formatted = (newStatus || '').replace(/_/g, ' ');
    const result = await dispatch(
      updateCandidateStatus({
        id: appId,
        status: newStatus,
        note: `Moved to ${formatted}`,
      })
    );
    if (updateCandidateStatus.fulfilled.match(result)) {
      notify.success(`Candidate marked as ${formatted}.`);
      dispatch(fetchDashboardAnalytics());
      dispatch(fetchRecruiterApplications({ limit: 20 }));
    }
  };

  const handleMarkNotifRead = async (notifId) => {
    await dispatch(markNotificationRead(notifId));
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  // Filtered internships for the Internships tab
  const filteredInternships = (internships || []).filter((i) => {
    if (internshipFilterStatus === 'ALL') return true;
    return i.status === internshipFilterStatus;
  });

  // Shortlisted & Selected talent for the Candidates tab
  const talentPool = (recruiterApplications?.data || []).filter((a) =>
    ['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(a.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex selection:bg-brand-500/20 selection:text-brand-700">
      {/* Desktop Sidebar (Sidebar + Content layout) */}
      <RecruiterSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        unreadNotifsCount={unreadNotifsCount}
        applicationsCount={metrics?.totalApplications || 0}
        upcomingInterviewsCount={metrics?.upcomingInterviews || 0}
        className="hidden md:flex sticky top-0 h-screen z-30"
      />

      {/* Mobile Drawer (Collapsible sidebar for Tablet & Mobile) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full z-10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Recruiter Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RecruiterSidebar
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              unreadNotifsCount={unreadNotifsCount}
              applicationsCount={metrics?.totalApplications || 0}
              upcomingInterviewsCount={metrics?.upcomingInterviews || 0}
              className="w-full flex-1 border-0"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold hidden sm:inline">
                Portal /
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 capitalize">
                {activeSection}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/recruiter/internships/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="hidden sm:inline-flex"
              >
                Post Internship
              </Button>
            </Link>

            <NotificationBell />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Avatar name={user?.name || 'Recruiter'} size="sm" />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                  {user?.name || 'Recruiter'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {company?.name || 'Company'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Error Banner with Recovery */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs">
              <span>{error}</span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => dispatch(fetchDashboardAnalytics())}
                className="border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                Retry Loading
              </Button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1: OVERVIEW & ANALYTICS
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Active Internships */}
                <div
                  onClick={() => handleSelectSection('internships')}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                      Active Internships
                    </span>
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {metrics.activeInternships}
                  </p>
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                    <span>Live postings</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>

                {/* 2. Total Applications */}
                <div
                  onClick={() => handleSelectSection('applications')}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                      Total Applications
                    </span>
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {metrics.totalApplications}
                  </p>
                  <p className="text-[11px] text-blue-600 flex items-center gap-1 font-medium">
                    <span>View all submissions</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>

                {/* 3. Shortlisted Candidates */}
                <div
                  onClick={() => handleSelectSection('candidates')}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                      Shortlisted
                    </span>
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {metrics.shortlistedCandidates}
                  </p>
                  <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                    <span>Qualified talent</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>

                {/* 4. Upcoming Interviews */}
                <div
                  onClick={() => handleSelectSection('interviews')}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-teal-500/40 transition-all cursor-pointer shadow-sm space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                      Interviews
                    </span>
                    <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {metrics.upcomingInterviews}
                  </p>
                  <p className="text-[11px] text-teal-600 flex items-center gap-1 font-medium">
                    <span>Scheduled calls</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>

                {/* 5. Selected Candidates */}
                <div
                  onClick={() => handleSelectSection('candidates')}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-purple-500/40 transition-all cursor-pointer shadow-sm space-y-2 group col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                      Accepted / Hired
                    </span>
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 font-mono">
                    {metrics.selectedCandidates}
                  </p>
                  <p className="text-[11px] text-purple-600 flex items-center gap-1 font-medium">
                    <span>Offers accepted</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>
              </div>

              {/* Dynamic Analytics Charts Grid */}
              {analyticsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
                  <Skeleton className="h-72 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Chart Row: Weekly Trend (2 Cols) + Status Donut (1 Col) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <WeeklyApplicationsChart data={analytics.applicationsByWeek} />
                    </div>
                    <div>
                      <StatusDistributionChart data={analytics.statusDistribution} />
                    </div>
                  </div>

                  {/* Secondary Chart Row: Top Postings Breakdown */}
                  <InternshipBreakdownChart data={analytics.applicationsByInternship} />
                </div>
              )}

              {/* Streams Row: Upcoming Interviews & Recent Candidates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Interviews Widget */}
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <CardTitle className="text-sm font-bold text-slate-900">Upcoming Interviews</CardTitle>
                    </div>
                    <button
                      onClick={() => handleSelectSection('interviews')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      View All
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {upcomingInterviews.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No upcoming interviews scheduled.
                      </p>
                    ) : (
                      upcomingInterviews.map((int) => (
                        <div
                          key={int._id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900">
                              {int.studentId?.name || 'Candidate'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {int.internshipId?.title || 'Internship'} • {new Date(int.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          {int.meetingLink && (
                            <a
                              href={int.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="primary" size="xs" leftIcon={<Video className="w-3.5 h-3.5" />}>
                                Join Call
                              </Button>
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Candidates Widget */}
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-600" />
                      <CardTitle className="text-sm font-bold text-slate-900">Recent Applicants</CardTitle>
                    </div>
                    <button
                      onClick={() => handleSelectSection('applications')}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      View All
                    </button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {recentApplications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No applications received yet.
                      </p>
                    ) : (
                      recentApplications.map((app) => (
                        <div
                          key={app._id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar name={app.studentId?.name || 'Student'} size="sm" />
                            <div className="space-y-0.5">
                              <Link
                                to={`/recruiter/applications/${app._id}`}
                                className="text-xs font-bold text-slate-900 hover:text-brand-600 transition-colors"
                              >
                                {app.studentId?.name || 'Anonymous Student'}
                              </Link>
                              <p className="text-[10px] text-slate-500">
                                {app.internshipId?.title || 'Internship'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                app.status === 'SELECTED'
                                  ? 'success'
                                  : app.status === 'SHORTLISTED'
                                  ? 'warning'
                                  : 'primary'
                              }
                              size="xs"
                            >
                              {(app.status || 'SUBMITTED').replace(/_/g, ' ')}
                            </Badge>
                            <Link to={`/recruiter/applications/${app._id}`}>
                              <ChevronRight className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2: COMPANY PROFILE
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'company' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Company Profile & Branding</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        Showcase your company brand to attract software engineering interns.
                      </p>
                    </div>
                    {company?.verified && (
                      <Badge variant="primary" size="md">
                        <ShieldCheck className="w-4 h-4 mr-1 text-brand-600" />
                        Verified Partner
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company Name"
                        required
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      />
                      <Input
                        label="Industry"
                        placeholder="e.g. Software & Technology, Fintech, AI"
                        value={companyForm.industry}
                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Company Size"
                        options={[
                          { value: '1-10', label: '1-10 employees' },
                          { value: '11-50', label: '11-50 employees' },
                          { value: '51-200', label: '51-200 employees' },
                          { value: '201-500', label: '201-500 employees' },
                          { value: '500+', label: '500+ enterprise' },
                        ]}
                        value={companyForm.companySize}
                        onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                      />
                      <Input
                        label="Website URL"
                        placeholder="https://company.com"
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Headquarters Location"
                        placeholder="e.g. San Francisco, CA"
                        value={companyForm.location}
                        onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                      />
                      <Input
                        label="Logo Image URL"
                        placeholder="https://cdn.example.com/logo.png"
                        value={companyForm.logo}
                        onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                      />
                    </div>

                    <Textarea
                      label="About Company / Mission"
                      placeholder="Describe what your engineering team builds and company culture..."
                      rows={4}
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    />

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <Button
                        variant="primary"
                        type="submit"
                        isLoading={saving}
                        loadingText="Saving Profile..."
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        Save Company Profile
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3: INTERNSHIPS MANAGEMENT
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'internships' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setInternshipFilterStatus(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        internshipFilterStatus === st
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'ALL' ? 'All Roles' : st}
                    </button>
                  ))}
                </div>

                <Link to="/recruiter/internships/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Post Internship
                  </Button>
                </Link>
              </div>

              {filteredInternships.length === 0 ? (
                <Card className="border-slate-200 bg-white py-12 shadow-sm">
                  <CardContent>
                    <EmptyState
                      icon={<Briefcase className="w-12 h-12 text-slate-400 mx-auto" />}
                      title="No internships found"
                      description="Create and publish your internship postings to receive applications."
                      action={
                        <Link to="/recruiter/internships/new">
                          <Button variant="primary" size="sm">
                            Create First Role
                          </Button>
                        </Link>
                      }
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3.5">
                  {filteredInternships.map((role) => (
                    <div
                      key={role._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-slate-900">{role.title}</h2>
                          <Badge
                            variant={
                              role.status === 'PUBLISHED'
                                ? 'success'
                                : role.status === 'CLOSED'
                                ? 'danger'
                                : 'warning'
                            }
                            size="xs"
                          >
                            {role.status}
                          </Badge>
                          <span className="text-xs text-slate-500 font-mono">
                            {role.applicationsCount || 0} applicants
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {role.remote || 'Remote'} • {role.duration || '3 Months'} • Deadline:{' '}
                          {new Date(role.applicationDeadline).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {role.status !== 'CLOSED' && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleTogglePublish(role)}
                          >
                            {role.status === 'PUBLISHED' ? 'Revert to Draft' : 'Publish Role'}
                          </Button>
                        )}
                        {role.status === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleClosePosting(role._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Close
                          </Button>
                        )}
                        <Link to={`/recruiter/internships/${role._id}/edit`}>
                          <Button variant="outline" size="xs">
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/recruiter/applications?internshipId=${role._id}`}>
                          <Button variant="primary" size="xs">
                            View Applicants
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4: APPLICATIONS STREAM
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'applications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">All Candidate Applications</h2>
                <Link to="/recruiter/applications">
                  <Button variant="ghost" size="xs" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Full Review Board
                  </Button>
                </Link>
              </div>

              {(recruiterApplications?.data || []).length === 0 ? (
                <Card className="border-slate-200 bg-white py-12 shadow-sm">
                  <CardContent>
                    <EmptyState
                      icon={<Users className="w-12 h-12 text-slate-400 mx-auto" />}
                      title="No applications received yet"
                      description="When students apply, their verified profiles will appear here for review."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(recruiterApplications?.data || []).map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar name={app.studentId?.name || 'Applicant'} size="md" />
                        <div className="space-y-0.5">
                          <Link
                            to={`/recruiter/applications/${app._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            {app.studentId?.name || 'Anonymous Student'}
                          </Link>
                          <p className="text-xs text-slate-500">
                            Applied for <strong className="text-slate-800">{app.internshipId?.title}</strong>
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {app.studentId?.email} • {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            app.status === 'SELECTED'
                              ? 'success'
                              : app.status === 'SHORTLISTED'
                              ? 'warning'
                              : app.status === 'INTERVIEW'
                              ? 'info'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {(app.status || 'SUBMITTED').replace(/_/g, ' ')}
                        </Badge>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleQuickStatus(app._id, 'SHORTLISTED')}
                        >
                          Shortlist
                        </Button>
                        <Link to={`/recruiter/applications/${app._id}`}>
                          <Button variant="primary" size="xs">
                            Review Candidate
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5: CANDIDATES / TALENT POOL
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'candidates' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">Qualified Candidate Directory</h2>
                <p className="text-xs text-slate-500">
                  Talent shortlisted, interviewing, or accepted for your internships.
                </p>
              </div>

              {talentPool.length === 0 ? (
                <Card className="border-slate-200 bg-white py-12 shadow-sm">
                  <CardContent>
                    <EmptyState
                      icon={<UserCheck className="w-12 h-12 text-slate-400 mx-auto" />}
                      title="No shortlisted candidates yet"
                      description="Shortlist candidates from your applications review board to build your active hiring pipeline."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {talentPool.map((app) => (
                    <div
                      key={app._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar name={app.studentId?.name || 'Candidate'} size="md" />
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">
                                {app.studentId?.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {app.studentId?.email}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={app.status === 'SELECTED' ? 'success' : 'warning'}
                            size="xs"
                          >
                            {app.status}
                          </Badge>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-slate-500">Applied Role:</span>
                          <p className="font-semibold text-brand-600 truncate">
                            {app.internshipId?.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        {app.resume?.url ? (
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:text-brand-600"
                          >
                            Resume
                          </a>
                        ) : <span />}

                        <Link to={`/recruiter/applications/${app._id}`}>
                          <Button variant="outline" size="xs" rightIcon={<ChevronRight className="w-3 h-3" />}>
                            Candidate Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 6: INTERVIEWS
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'interviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Interview Schedule</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Technical screens, video calls, and on-site interviews.
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl self-start sm:self-auto">
                  <button
                    onClick={() => setInterviewViewMode('list')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      interviewViewMode === 'list'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setInterviewViewMode('calendar')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      interviewViewMode === 'calendar'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Calendar View
                  </button>
                </div>
              </div>

              {interviewViewMode === 'calendar' ? (
                <CalendarView
                  interviews={interviews}
                  isRecruiter={true}
                  onReschedule={handleOpenReschedule}
                  onCancel={handleOpenCancel}
                />
              ) : interviews.length === 0 ? (
                <Card className="border-slate-200 bg-white py-12 shadow-sm">
                  <CardContent>
                    <EmptyState
                      icon={<Calendar className="w-12 h-12 text-slate-400 mx-auto" />}
                      title="No interviews scheduled yet"
                      description="To schedule an interview, open a candidate profile from Applications and click 'Schedule Interview'."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3.5">
                  {interviews.map((int) => (
                    <div
                      key={int._id}
                      className="p-5 rounded-2xl bg-white border border-teal-200 hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {int.studentId?.name || 'Candidate'}
                            </h3>
                            <Badge
                              variant={
                                int.status === 'COMPLETED'
                                  ? 'success'
                                  : int.status === 'CANCELLED'
                                  ? 'danger'
                                  : int.status === 'RESCHEDULED'
                                  ? 'warning'
                                  : 'info'
                              }
                              size="xs"
                            >
                              {int.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">
                            Role: <strong className="text-slate-900">{int.internshipId?.title}</strong> • Duration: {int.durationMinutes || 45} mins
                          </p>
                          <p className="text-[11px] text-teal-700 font-mono font-semibold">
                            Scheduled: {new Date(int.scheduledAt).toLocaleString()}
                          </p>
                          {int.notes && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                              Notes: {int.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {int.meetingLink && int.status !== 'CANCELLED' && (
                          <a
                            href={int.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="primary" size="xs" leftIcon={<Video className="w-3.5 h-3.5" />}>
                              Join Meeting
                            </Button>
                          </a>
                        )}

                        {int.status !== 'CANCELLED' && int.status !== 'COMPLETED' && (
                          <>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenReschedule(int)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleOpenCancel(int)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        <Link to={`/recruiter/applications/${int.applicationId}`}>
                          <Button variant="outline" size="xs">
                            Candidate Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reschedule Interview Modal */}
              <RescheduleInterviewModal
                isOpen={rescheduleModalOpen}
                onClose={() => {
                  setRescheduleModalOpen(false);
                  setSelectedInterview(null);
                }}
                interview={selectedInterview}
                onConfirm={handleConfirmReschedule}
                loading={interviewActionLoading}
              />

              {/* Cancel Interview Modal */}
              <CancelInterviewModal
                isOpen={cancelModalOpen}
                onClose={() => {
                  setCancelModalOpen(false);
                  setSelectedInterview(null);
                }}
                interview={selectedInterview}
                onConfirm={handleConfirmCancel}
                loading={interviewActionLoading}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 7: NOTIFICATIONS
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'notifications' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-600" />
                  Recruiter Alerts & Activity Feed
                </h2>
                {unreadNotifsCount > 0 && (
                  <Badge variant="primary" size="sm">
                    {unreadNotifsCount} Unread
                  </Badge>
                )}
              </div>

              {notifications.length === 0 ? (
                <Card className="border-slate-200 bg-white py-12 shadow-sm">
                  <CardContent>
                    <EmptyState
                      icon={<Bell className="w-12 h-12 text-slate-400 mx-auto" />}
                      title="No notifications"
                      description="You're all caught up! New applicant alerts and status triggers will appear here."
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 shadow-xs ${
                        n.read
                          ? 'bg-white border-slate-200'
                          : 'bg-brand-50/50 border-brand-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-600" />
                          )}
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {n.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono pt-1">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {!n.read && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkNotifRead(n._id)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 8: SETTINGS
          ══════════════════════════════════════════════════════════════════ */}
          {activeSection === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        New Applicant Email Alerts
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Receive instant notifications when students submit applications.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        Interview Schedule Reminders
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Get 24h & 1h advance reminders prior to scheduled candidate calls.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Recruiter Name:</span>
                    <strong className="text-slate-900">{user?.name}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500">Login Email:</span>
                    <strong className="text-slate-900 font-mono">{user?.email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Role:</span>
                    <Badge variant="success" size="xs">RECRUITER</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
