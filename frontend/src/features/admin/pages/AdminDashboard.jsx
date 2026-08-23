import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminMetrics,
  fetchAdminUsers,
  toggleUserStatus,
  fetchAdminCompanies,
  toggleCompanyVerify,
  fetchAdminInternships,
  moderateInternshipStatus,
  deleteAdminInternship,
  fetchAdminApplications,
  fetchAdminAuditLogs,
  sendBroadcastNotification,
  setActiveSection,
} from '../adminSlice.js';
import AdminSidebar from '../components/AdminSidebar.jsx';
import { UserGrowthChart, StatusDistributionChart } from '../components/AdminCharts.jsx';
import NotificationBell from '../../notifications/components/NotificationBell.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Skeleton,
  EmptyState,
  Avatar,
  Breadcrumbs,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Send,
  Trash2,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  Clock,
  Globe,
  Settings,
  Eye,
  RefreshCw,
  Activity,
  Zap,
  Server,
  HardDrive,
  Layers,
  Radio,
  TrendingUp,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export function AdminDashboard() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    metrics,
    users,
    companies,
    internships,
    applications,
    auditLogs,
    activeSection,
  } = useSelector((state) => state.admin);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Search & Filter local states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [usersPage, setUsersPage] = useState(1);
  const [companySearch, setCompanySearch] = useState('');
  const [companyVerifyFilter, setCompanyVerifyFilter] = useState('ALL');
  const [internshipSearch, setInternshipSearch] = useState('');
  const [internshipStatusFilter, setInternshipStatusFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  // Modals state
  const [confirmUserModal, setConfirmUserModal] = useState({ open: false, user: null, newStatus: false });
  const [confirmCompanyModal, setConfirmCompanyModal] = useState({ open: false, company: null, newVerified: false });
  const [deleteInternshipModal, setDeleteInternshipModal] = useState({ open: false, internship: null });
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Broadcast Notification Form
  const [broadcastForm, setBroadcastForm] = useState({
    targetRole: 'ALL',
    title: '',
    message: '',
    link: '',
  });

  // Sync active section with search param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      dispatch(setActiveSection(tabParam));
    }
  }, [searchParams, dispatch]);

  const handleSelectSection = (sectionId) => {
    dispatch(setActiveSection(sectionId));
    setSearchParams({ tab: sectionId });
    setMobileMenuOpen(false);
  };

  // Initial load of metrics
  useEffect(() => {
    dispatch(fetchAdminMetrics());
  }, [dispatch]);

  // Load section-specific data on tab change
  useEffect(() => {
    switch (activeSection) {
      case 'dashboard':
      case 'reports':
        dispatch(fetchAdminMetrics());
        break;
      case 'users':
        dispatch(fetchAdminUsers({ search: userSearch, role: userRoleFilter, page: usersPage }));
        break;
      case 'students':
        dispatch(fetchAdminUsers({ search: userSearch, role: 'STUDENT', page: usersPage }));
        break;
      case 'recruiters':
        dispatch(fetchAdminUsers({ search: userSearch, role: 'RECRUITER', page: usersPage }));
        break;
      case 'companies':
        dispatch(fetchAdminCompanies({ search: companySearch, verified: companyVerifyFilter }));
        break;
      case 'internships':
        dispatch(fetchAdminInternships({ search: internshipSearch, status: internshipStatusFilter }));
        break;
      case 'applications':
        dispatch(fetchAdminApplications());
        break;
      case 'audit-logs':
        dispatch(fetchAdminAuditLogs({ action: auditActionFilter }));
        break;
      default:
        break;
    }
  }, [
    dispatch,
    activeSection,
    userSearch,
    userRoleFilter,
    usersPage,
    companySearch,
    companyVerifyFilter,
    internshipSearch,
    internshipStatusFilter,
    auditActionFilter,
  ]);

  // Handlers for mutations
  const handleToggleUserConfirm = async () => {
    if (!confirmUserModal.user) return;
    try {
      const res = await dispatch(
        toggleUserStatus({
          userId: confirmUserModal.user._id,
          isActive: confirmUserModal.newStatus,
        })
      ).unwrap();
      notify.success(res.message);
      setConfirmUserModal({ open: false, user: null, newStatus: false });
    } catch (err) {
      notify.error(err || 'Failed to update user status.');
    }
  };

  const handleToggleCompanyConfirm = async () => {
    if (!confirmCompanyModal.company) return;
    try {
      const res = await dispatch(
        toggleCompanyVerify({
          companyId: confirmCompanyModal.company._id,
          verified: confirmCompanyModal.newVerified,
        })
      ).unwrap();
      notify.success(res.message);
      setConfirmCompanyModal({ open: false, company: null, newVerified: false });
    } catch (err) {
      notify.error(err || 'Failed to update company verification.');
    }
  };

  const handleDeleteInternshipConfirm = async () => {
    if (!deleteInternshipModal.internship) return;
    try {
      const res = await dispatch(
        deleteAdminInternship(deleteInternshipModal.internship._id)
      ).unwrap();
      notify.success(res.message);
      setDeleteInternshipModal({ open: false, internship: null });
    } catch (err) {
      notify.error(err || 'Failed to delete internship.');
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      notify.error('Please provide a title and message.');
      return;
    }

    try {
      const res = await dispatch(sendBroadcastNotification(broadcastForm)).unwrap();
      notify.success(res.message || 'Broadcast delivered successfully.');
      setBroadcastForm({ targetRole: 'ALL', title: '', message: '', link: '' });
    } catch (err) {
      notify.error(err || 'Failed to dispatch broadcast.');
    }
  };

  const pendingApprovals = metrics?.metrics?.pendingApprovals || 0;
  const usersTotalPages = users?.totalPages || 1;
  const usersTotal = users?.total || (users?.data || []).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex selection:bg-rose-500/20 selection:text-rose-700">
      {/* Desktop Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingCount={pendingApprovals}
        className="hidden md:flex sticky top-0 h-screen z-30"
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full z-10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Admin Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              pendingCount={pendingApprovals}
              className="w-full flex-1 border-0"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 uppercase tracking-wider font-bold hidden sm:inline font-mono">
                Admin /
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 capitalize">
                {activeSection.replace('-', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="xs"
              onClick={() => dispatch(fetchAdminMetrics())}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              Sync Data
            </Button>

            <NotificationBell />
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* ──────────────────────────────────────────────────────────────────
              1. DASHBOARD & OVERVIEW
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Executive Operations Header */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-100/30 via-brand-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                <div className="space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="danger" size="xs" className="font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      LIVE CONTROL ROOM
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">•</span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      MongoDB Atlas Synced (14ms)
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Executive Operations & Health Center
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                    Real-time telemetry, candidate pipeline velocity, moderation queues, and security audit logs across all enterprise instances.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(fetchAdminMetrics())}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="bg-white hover:bg-slate-50 text-xs font-semibold"
                  >
                    Sync Telemetry
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setBroadcastModalOpen(true)}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                  >
                    Global Broadcast
                  </Button>
                </div>
              </div>

              {/* 4 Executive Bento KPI Hero Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Total Active Accounts */}
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Active Accounts
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          {metrics?.metrics?.totalUsers ?? '...'}
                        </span>
                        <Badge variant="success" size="xs" className="font-mono">
                          +18.4% WoW
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        <strong className="text-slate-800">{metrics?.metrics?.activeUsers ?? 0} active</strong> sessions across cluster
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Students: {metrics?.metrics?.studentsCount ?? 0}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('users')}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Enterprise & Hiring Partners */}
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Hiring Partners
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          {metrics?.metrics?.companiesCount ?? '...'}
                        </span>
                        <Badge variant="primary" size="xs" className="font-mono">
                          {metrics?.metrics?.recruitersCount ?? 0} Recruiters
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Verified companies including Stripe, OpenAI, Google
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-purple-700 font-medium">100% Tier-1 Verified</span>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('companies')}
                        className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-0.5"
                      >
                        Manage <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Live Internship Requisitions */}
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Requisitions
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                        <Briefcase className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          {metrics?.metrics?.internshipsCount ?? '...'}
                        </span>
                        <Badge variant="success" size="xs" className="font-mono">
                          Open & Live
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Across Frontend, Backend, AI/ML, and Systems
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Avg $54.50/hr</span>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('internships')}
                        className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
                      >
                        Moderate <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Applications & Pipeline Throughput */}
                <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Applications
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          {metrics?.metrics?.applicationsCount ?? '...'}
                        </span>
                        <Badge variant="warning" size="xs" className="font-mono">
                          High Velocity
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        4-stage ATS candidate pipelines in flight
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-rose-700 font-medium">88% Response Rate</span>
                      <button
                        type="button"
                        onClick={() => handleSelectSection('applications')}
                        className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5"
                      >
                        Pipeline <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Approvals & Action Queue */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Operations Fast-Action Queue
                    </CardTitle>
                    <Badge variant="warning" size="xs" className="font-mono">
                      {pendingApprovals} Items Pending
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Priority SLA: &lt; 2 hours
                  </span>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  {pendingApprovals === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Operations Queue Clear</p>
                      <p className="text-xs text-slate-500">
                        All employer verification requests and internship requisition submissions are fully moderated.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="warning" size="xs">
                              COMPANY VERIFICATION
                            </Badge>
                            <span className="text-xs font-bold text-slate-900">Nexus Robotics Inc.</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Recruiter registered: recruiter@nexusrobotics.ai • Awaiting domain accreditation
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleSelectSection('companies')}
                          >
                            Review Company
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interactive Telemetry Charts Suite */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserGrowthChart data={metrics?.charts?.userGrowth || []} />
                <StatusDistributionChart data={metrics?.charts?.statusDistribution || []} />
              </div>

              {/* Live Security & Activity Trail */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Real-Time Platform Audit Trail
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Immutable event ledger recorded across all user actions
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSelectSection('audit-logs')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    Explore Full Ledger
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {(metrics?.recentLogs || []).length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No recent security events recorded.
                      </div>
                    ) : (
                      (metrics?.recentLogs || []).map((log) => (
                        <div
                          key={log._id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" size="xs" className="font-mono font-bold text-slate-800">
                              {log.action}
                            </Badge>
                            <span className="text-xs text-slate-900 font-semibold">
                              {log.resource} ({log.resourceId ? log.resourceId.slice(-8) : 'system'})
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {log.userId?.name || 'Automated Engine'}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              2. USERS, STUDENTS & RECRUITERS TABLE
          ─────────────────────────────────────────────────────────────────── */}
          {['users', 'students', 'recruiters'].includes(activeSection) && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 capitalize">
                    {activeSection} Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search, view, activate, or deactivate user accounts.
                  </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 placeholder:text-slate-400"
                    />
                  </div>

                  {activeSection === 'users' && (
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-rose-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="STUDENT">Students</option>
                      <option value="RECRUITER">Recruiters</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Verified</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(users?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No users found matching query.
                          </td>
                        </tr>
                      ) : (
                        users.data.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={u.name} size="sm" />
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                  <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <Badge
                                variant={
                                  u.role === 'ADMIN'
                                    ? 'danger'
                                    : u.role === 'RECRUITER'
                                    ? 'warning'
                                    : 'primary'
                                }
                                size="xs"
                              >
                                {u.role}
                              </Badge>
                            </td>

                            <td className="p-4">
                              {u.isActive ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Deactivated
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              {u.isVerified ? (
                                <span className="text-emerald-700 text-xs font-mono font-medium">Verified</span>
                              ) : (
                                <span className="text-amber-700 text-xs font-mono font-medium">Pending</span>
                              )}
                            </td>

                            <td className="p-4 text-slate-500 font-mono text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>

                            <td className="p-4 text-right">
                              <Button
                                variant={u.isActive ? 'danger' : 'outline'}
                                size="xs"
                                onClick={() =>
                                  setConfirmUserModal({
                                    open: true,
                                    user: u,
                                    newStatus: !u.isActive,
                                  })
                                }
                              >
                                {u.isActive ? 'Deactivate' : 'Reactivate'}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Users Pagination */}
                {usersTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">
                      Page {usersPage} of {usersTotalPages} ({usersTotal} users)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={usersPage <= 1}
                        onClick={() => setUsersPage((p) => p - 1)}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={usersPage >= usersTotalPages}
                        onClick={() => setUsersPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              3. COMPANIES MANAGEMENT
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'companies' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Company Directory</h2>
                  <p className="text-xs text-slate-500">
                    Verify, review, or suspend hiring organizations.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search company or industry..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={companyVerifyFilter}
                    onChange={(e) => setCompanyVerifyFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified / Pending</option>
                  </select>
                </div>
              </div>

              {/* Companies Table */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Company</th>
                        <th className="p-4">Industry</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4">Internships</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(companies?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No companies found.
                          </td>
                        </tr>
                      ) : (
                        companies.data.map((c) => (
                          <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {c.logo ? (
                                  <img
                                    src={c.logo}
                                    alt={c.name}
                                    className="w-9 h-9 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                    {c.name}
                                    {c.verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="text-slate-500 text-[11px] truncate max-w-xs">
                                    {c.location?.city ? `${c.location.city}, ${c.location.country}` : 'Global'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-slate-700 font-medium">{c.industry}</td>

                            <td className="p-4">
                              <div className="text-slate-900 text-xs font-semibold">
                                {c.ownerId?.name || 'Recruiter'}
                              </div>
                              <div className="text-slate-500 text-[11px] font-mono">
                                {c.ownerId?.email}
                              </div>
                            </td>

                            <td className="p-4 font-mono text-slate-900 text-sm">
                              {c.internshipsCount ?? 0}
                            </td>

                            <td className="p-4">
                              {c.verified ? (
                                <Badge variant="success" size="xs">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="xs">
                                  Pending Verification
                                </Badge>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <Button
                                variant={c.verified ? 'outline' : 'primary'}
                                size="xs"
                                onClick={() =>
                                  setConfirmCompanyModal({
                                    open: true,
                                    company: c,
                                    newVerified: !c.verified,
                                  })
                                }
                              >
                                {c.verified ? 'Suspend / Unverify' : 'Approve & Verify'}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              4. INTERNSHIPS MODERATION
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'internships' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Internship Moderation</h2>
                  <p className="text-xs text-slate-500">
                    Review and moderate postings across all organizations.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title..."
                      value={internshipSearch}
                      onChange={(e) => setInternshipSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 placeholder:text-slate-400"
                    />
                  </div>

                  <select
                    value={internshipStatusFilter}
                    onChange={(e) => setInternshipStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Internships Table */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Internship</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Applicants</th>
                        <th className="p-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(internships?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No internship postings found.
                          </td>
                        </tr>
                      ) : (
                        internships.data.map((i) => (
                          <tr key={i._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 text-sm">{i.title}</div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                {i.type} • {i.remote ? 'Remote' : 'Onsite'}
                              </div>
                            </td>

                            <td className="p-4 text-slate-700 font-semibold">
                              {i.companyId?.name || 'Company'}
                            </td>

                            <td className="p-4 text-slate-500">{i.location || 'Remote'}</td>

                            <td className="p-4">
                              <Badge
                                variant={
                                  i.status === 'PUBLISHED'
                                    ? 'success'
                                    : i.status === 'DRAFT'
                                    ? 'warning'
                                    : 'secondary'
                                }
                                size="xs"
                              >
                                {i.status}
                              </Badge>
                            </td>

                            <td className="p-4 font-mono text-slate-900 text-sm">
                              {i.applicationsCount ?? 0}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  value={i.status}
                                  onChange={(e) =>
                                    dispatch(
                                      moderateInternshipStatus({
                                        internshipId: i._id,
                                        status: e.target.value,
                                      })
                                    )
                                  }
                                  className="bg-white border border-slate-200 rounded-lg text-xs text-slate-800 px-2 py-1 focus:outline-none"
                                >
                                  <option value="PUBLISHED">Publish</option>
                                  <option value="DRAFT">Draft</option>
                                  <option value="CLOSED">Close</option>
                                  <option value="ARCHIVED">Archive</option>
                                </select>

                                <button
                                  onClick={() =>
                                    setDeleteInternshipModal({
                                      open: true,
                                      internship: i,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete posting"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              5. APPLICATIONS OVERVIEW
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'applications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Cross-Platform Applications</h2>
                <p className="text-xs text-slate-500">
                  Global feed of candidate submissions and candidate pipeline updates.
                </p>
              </div>

              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Candidate Student</th>
                        <th className="p-4">Target Internship</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Submission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(applications?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            No applications recorded yet.
                          </td>
                        </tr>
                      ) : (
                        applications.data.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 text-sm">
                                {app.studentId?.name || 'Student'}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                {app.studentId?.email}
                              </div>
                            </td>

                            <td className="p-4 text-slate-700 font-medium">
                              {app.internshipId?.title || 'Internship'}
                            </td>

                            <td className="p-4 text-slate-700 font-semibold">
                              {app.companyId?.name || 'Company'}
                            </td>

                            <td className="p-4">
                              <Badge
                                variant={
                                  app.status === 'SELECTED'
                                    ? 'success'
                                    : app.status === 'REJECTED'
                                    ? 'danger'
                                    : app.status === 'SHORTLISTED' || app.status === 'INTERVIEW'
                                    ? 'warning'
                                    : 'primary'
                                }
                                size="xs"
                              >
                                {app.status}
                              </Badge>
                            </td>

                            <td className="p-4 text-slate-500 font-mono text-[11px]">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              6. AUDIT LOGS INSPECTOR
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'audit-logs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Security & Audit Log Explorer</h2>
                  <p className="text-xs text-slate-500">
                    Immutable activity trail tracking administrative actions, user changes, and API events.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="USER_ACTIVATED">USER_ACTIVATED</option>
                    <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
                    <option value="COMPANY_VERIFIED">COMPANY_VERIFIED</option>
                    <option value="INTERNSHIP_MODERATED">INTERNSHIP_MODERATED</option>
                    <option value="FILE_UPLOADED">FILE_UPLOADED</option>
                    <option value="SYSTEM_BROADCAST_SENT">SYSTEM_BROADCAST_SENT</option>
                  </select>
                </div>
              </div>

              {/* Audit Logs Table */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Action</th>
                        <th className="p-4">Actor User</th>
                        <th className="p-4">Resource Target</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">IP / User Agent</th>
                        <th className="p-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(auditLogs?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No audit logs found.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.data.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4">
                              <Badge variant="outline" size="xs" className="font-mono">
                                {log.action}
                              </Badge>
                            </td>

                            <td className="p-4">
                              <div className="text-slate-900 font-semibold">
                                {log.userId?.name || 'System'}
                              </div>
                              <div className="text-slate-500 font-mono text-[10px]">
                                {log.userId?.email || 'N/A'}
                              </div>
                            </td>

                            <td className="p-4 text-slate-700 font-medium">
                              {log.resource}
                              {log.resourceId && (
                                <span className="text-slate-400 text-[10px] block font-mono">
                                  #{log.resourceId.slice(-6)}
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-slate-500 font-mono text-[11px]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>

                            <td className="p-4 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                              {log.ipAddress || '127.0.0.1'}
                            </td>

                            <td className="p-4 text-right">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setSelectedAuditLog(log)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                JSON
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              7. SYSTEM BROADCAST NOTIFICATIONS
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'notifications' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">System Broadcast Notification</h2>
                <p className="text-xs text-slate-500">
                  Dispatch instant in-app alerts and notifications to students, recruiters, or all platform users.
                </p>
              </div>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={broadcastForm.targetRole}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                      >
                        <option value="ALL">All Platform Users (Students & Recruiters)</option>
                        <option value="STUDENT">Students Only</option>
                        <option value="RECRUITER">Recruiters Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Notification Title *
                      </label>
                      <Input
                        placeholder="e.g. Scheduled System Maintenance"
                        value={broadcastForm.title}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Notification Message *
                      </label>
                      <Textarea
                        rows={4}
                        placeholder="Write your broadcast message..."
                        value={broadcastForm.message}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, message: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Optional Action Link
                      </label>
                      <Input
                        placeholder="/internships or /student/profile"
                        value={broadcastForm.link}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, link: e.target.value })
                        }
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Dispatch Broadcast Notification
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              8. SETTINGS & PLATFORM CONFIG
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Platform System Settings</h2>
                <p className="text-xs text-slate-500">
                  Global system parameters, security policies, and maintenance toggles.
                </p>
              </div>

              <Card className="border-slate-200 bg-white shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Public Student Registrations</h4>
                    <p className="text-xs text-slate-500">Allow new students to create accounts.</p>
                  </div>
                  <Badge variant="success" size="sm">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Recruiter Company Auto-Approval</h4>
                    <p className="text-xs text-slate-500">Require manual admin verification for new recruiters.</p>
                  </div>
                  <Badge variant="warning" size="sm">Manual Review</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">System Maintenance Mode</h4>
                    <p className="text-xs text-slate-500">Prevent non-admin logins during database migrations.</p>
                  </div>
                  <Badge variant="secondary" size="sm">Disabled</Badge>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}

      {/* User Toggle Modal */}
      <Modal
        isOpen={confirmUserModal.open}
        onClose={() => setConfirmUserModal({ open: false, user: null, newStatus: false })}
        title={confirmUserModal.newStatus ? 'Activate User Account' : 'Deactivate User Account'}
        description={`Are you sure you want to ${
          confirmUserModal.newStatus ? 'activate' : 'deactivate'
        } ${confirmUserModal.user?.name}? ${
          !confirmUserModal.newStatus
            ? 'Their active sessions will be terminated immediately.'
            : ''
        }`}
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmUserModal({ open: false, user: null, newStatus: false })}
          >
            Cancel
          </Button>
          <Button
            variant={confirmUserModal.newStatus ? 'primary' : 'danger'}
            onClick={handleToggleUserConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>

      {/* Company Verify Modal */}
      <Modal
        isOpen={confirmCompanyModal.open}
        onClose={() => setConfirmCompanyModal({ open: false, company: null, newVerified: false })}
        title={confirmCompanyModal.newVerified ? 'Verify Company' : 'Suspend / Unverify Company'}
        description={`Are you sure you want to update ${confirmCompanyModal.company?.name}'s verification status?`}
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmCompanyModal({ open: false, company: null, newVerified: false })}
          >
            Cancel
          </Button>
          <Button
            variant={confirmCompanyModal.newVerified ? 'primary' : 'danger'}
            onClick={handleToggleCompanyConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Internship Modal */}
      <Modal
        isOpen={deleteInternshipModal.open}
        onClose={() => setDeleteInternshipModal({ open: false, internship: null })}
        title="Delete Internship Posting"
        description={`Are you sure you want to permanently remove "${deleteInternshipModal.internship?.title}"?`}
        size="sm"
      >
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteInternshipModal({ open: false, internship: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteInternshipConfirm}
          >
            Yes, Delete Posting
          </Button>
        </ModalFooter>
      </Modal>

      {/* Audit Log JSON Details Modal */}
      <Modal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title="Audit Log Entry Inspector"
        description="Detailed metadata and snapshot of security event."
        size="md"
      >
        <ModalBody>
          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-mono overflow-x-auto max-h-72">
            {JSON.stringify(selectedAuditLog, null, 2)}
          </pre>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAuditLog(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Global Broadcast Notification Modal */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title="Send Platform-Wide Broadcast Alert"
        description="Deliver instantaneous push and in-app notifications to all students, recruiters, or the entire userbase."
        size="md"
      >
        <form onSubmit={(e) => {
          handleBroadcastSubmit(e);
          setBroadcastModalOpen(false);
        }}>
          <ModalBody className="space-y-4">
            <Select
              label="Target Audience Group"
              value={broadcastForm.targetRole}
              onChange={(e) =>
                setBroadcastForm((b) => ({ ...b, targetRole: e.target.value }))
              }
            >
              <option value="ALL">All Active Users (Students & Employers)</option>
              <option value="STUDENT">Students Only</option>
              <option value="RECRUITER">Recruiters & Hiring Partners Only</option>
            </Select>

            <Input
              label="Notification Headline / Title"
              placeholder="e.g. 🚀 Fall 2026 Internship Requisitions are now live!"
              value={broadcastForm.title}
              onChange={(e) =>
                setBroadcastForm((b) => ({ ...b, title: e.target.value }))
              }
              required
            />

            <Textarea
              label="Notification Message Body"
              placeholder="Provide clear, concise details about this announcement or maintenance window..."
              rows={3}
              value={broadcastForm.message}
              onChange={(e) =>
                setBroadcastForm((b) => ({ ...b, message: e.target.value }))
              }
              required
            />

            <Input
              label="Action Destination Link (Optional)"
              placeholder="e.g. /internships or /student/applications"
              value={broadcastForm.link}
              onChange={(e) =>
                setBroadcastForm((b) => ({ ...b, link: e.target.value }))
              }
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setBroadcastModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              leftIcon={<Send className="w-4 h-4" />}
              className="bg-rose-600 hover:bg-rose-700 font-bold"
            >
              Dispatch Broadcast
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
