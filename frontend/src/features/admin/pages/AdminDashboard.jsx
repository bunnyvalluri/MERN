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

  // Search & Filter local states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
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
        dispatch(fetchAdminUsers({ search: userSearch, role: userRoleFilter }));
        break;
      case 'students':
        dispatch(fetchAdminUsers({ search: userSearch, role: 'STUDENT' }));
        break;
      case 'recruiters':
        dispatch(fetchAdminUsers({ search: userSearch, role: 'RECRUITER' }));
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-rose-500/20 selection:text-rose-300">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 h-full z-10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Admin Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 uppercase tracking-wider font-bold hidden sm:inline font-mono">
                Admin /
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white capitalize">
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
              {/* Header Title */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Platform Operations & Health
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Real-time MongoDB platform metrics, active accounts, and application lifecycle distribution.
                </p>
              </div>

              {/* 8 Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-800 bg-slate-900/90 p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Total Users</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {metrics?.metrics?.totalUsers ?? '...'}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {metrics?.metrics?.activeUsers ?? 0} Active accounts
                  </div>
                </Card>

                <Card className="border-slate-800 bg-slate-900/90 p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Student Talent</span>
                    <Users className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {metrics?.metrics?.studentsCount ?? '...'}
                  </div>
                  <div className="text-[11px] text-slate-400">Registered candidates</div>
                </Card>

                <Card className="border-slate-800 bg-slate-900/90 p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Recruiters & Companies</span>
                    <Building2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {metrics?.metrics?.companiesCount ?? '...'}
                  </div>
                  <div className="text-[11px] text-purple-400 font-medium">
                    {metrics?.metrics?.recruitersCount ?? 0} Hiring managers
                  </div>
                </Card>

                <Card className="border-slate-800 bg-slate-900/90 p-4 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Internship Postings</span>
                    <FileCheck2 className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {metrics?.metrics?.internshipsCount ?? '...'}
                  </div>
                  <div className="text-[11px] text-teal-400 font-medium">
                    {metrics?.metrics?.applicationsCount ?? 0} Applications submitted
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserGrowthChart data={metrics?.charts?.userGrowth || []} />
                <StatusDistributionChart data={metrics?.charts?.statusDistribution || []} />
              </div>

              {/* Recent Activity Audit Stream */}
              <Card className="border-slate-800 bg-slate-900/90 shadow-card">
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <CardTitle className="text-sm font-bold text-white">Recent Security & Activity Trail</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSelectSection('audit-logs')}
                  >
                    View All Logs →
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800/80">
                    {(metrics?.recentLogs || []).map((log) => (
                      <div
                        key={log._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" size="xs" className="font-mono">
                            {log.action}
                          </Badge>
                          <span className="text-xs text-slate-300 font-medium">
                            {log.resource} ({log.resourceId ? log.resourceId.slice(-6) : 'system'})
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{log.userId?.name || 'System / Anonymous'}</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
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
                  <h2 className="text-xl font-bold text-white capitalize">
                    {activeSection} Directory
                  </h2>
                  <p className="text-xs text-slate-400">
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
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {activeSection === 'users' && (
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white px-3 py-1.5 focus:outline-none focus:border-rose-500"
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
              <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Verified</th>
                        <th className="p-4">Joined Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(users?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No users found matching query.
                          </td>
                        </tr>
                      ) : (
                        users.data.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={u.name} size="sm" />
                                <div>
                                  <div className="font-bold text-white text-sm">{u.name}</div>
                                  <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
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
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-xs">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Deactivated
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              {u.isVerified ? (
                                <span className="text-emerald-400 text-xs font-mono">Verified</span>
                              ) : (
                                <span className="text-amber-400 text-xs font-mono">Pending</span>
                              )}
                            </td>

                            <td className="p-4 text-slate-400 font-mono text-[11px]">
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
                                {u.isActive ? 'Deactivate' : 'Activate'}
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
              3. COMPANIES MANAGEMENT
          ─────────────────────────────────────────────────────────────────── */}
          {activeSection === 'companies' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Company Directory</h2>
                  <p className="text-xs text-slate-400">
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
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <select
                    value={companyVerifyFilter}
                    onChange={(e) => setCompanyVerifyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white px-3 py-1.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified / Pending</option>
                  </select>
                </div>
              </div>

              {/* Companies Table */}
              <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Company</th>
                        <th className="p-4">Industry</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4">Internships</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(companies?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No companies found.
                          </td>
                        </tr>
                      ) : (
                        companies.data.map((c) => (
                          <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {c.logo ? (
                                  <img
                                    src={c.logo}
                                    alt={c.name}
                                    className="w-9 h-9 rounded-xl object-contain bg-white/5 border border-slate-800 p-1"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                    {c.name}
                                    {c.verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                    )}
                                  </div>
                                  <div className="text-slate-400 text-[11px] truncate max-w-xs">
                                    {c.location?.city ? `${c.location.city}, ${c.location.country}` : 'Global'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-slate-300 font-medium">{c.industry}</td>

                            <td className="p-4">
                              <div className="text-white text-xs font-semibold">
                                {c.ownerId?.name || 'Recruiter'}
                              </div>
                              <div className="text-slate-500 text-[11px] font-mono">
                                {c.ownerId?.email}
                              </div>
                            </td>

                            <td className="p-4 font-mono text-white text-sm">
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
                  <h2 className="text-xl font-bold text-white">Internship Moderation</h2>
                  <p className="text-xs text-slate-400">
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
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <select
                    value={internshipStatusFilter}
                    onChange={(e) => setInternshipStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white px-3 py-1.5 focus:outline-none focus:border-rose-500"
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
              <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Internship</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Applicants</th>
                        <th className="p-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(internships?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No internship postings found.
                          </td>
                        </tr>
                      ) : (
                        internships.data.map((i) => (
                          <tr key={i._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{i.title}</div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                {i.type} • {i.remote ? 'Remote' : 'Onsite'}
                              </div>
                            </td>

                            <td className="p-4 text-slate-300 font-semibold">
                              {i.companyId?.name || 'Company'}
                            </td>

                            <td className="p-4 text-slate-400">{i.location || 'Remote'}</td>

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

                            <td className="p-4 font-mono text-white text-sm">
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
                                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-2 py-1 focus:outline-none"
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
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                <h2 className="text-xl font-bold text-white">Cross-Platform Applications</h2>
                <p className="text-xs text-slate-400">
                  Global feed of candidate submissions and candidate pipeline updates.
                </p>
              </div>

              <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Candidate Student</th>
                        <th className="p-4">Target Internship</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Submission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(applications?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">
                            No applications recorded yet.
                          </td>
                        </tr>
                      ) : (
                        applications.data.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">
                                {app.studentId?.name || 'Student'}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px]">
                                {app.studentId?.email}
                              </div>
                            </td>

                            <td className="p-4 text-slate-300 font-medium">
                              {app.internshipId?.title || 'Internship'}
                            </td>

                            <td className="p-4 text-slate-300 font-semibold">
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

                            <td className="p-4 text-slate-400 font-mono text-[11px]">
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
                  <h2 className="text-xl font-bold text-white">Security & Audit Log Explorer</h2>
                  <p className="text-xs text-slate-400">
                    Immutable activity trail tracking administrative actions, user changes, and API events.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={auditActionFilter}
                    onChange={(e) => setAuditActionFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl text-xs text-white px-3 py-1.5 focus:outline-none focus:border-rose-500"
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
              <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Action</th>
                        <th className="p-4">Actor User</th>
                        <th className="p-4">Resource Target</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">IP / User Agent</th>
                        <th className="p-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(auditLogs?.data || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-500">
                            No audit logs found.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.data.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <Badge variant="outline" size="xs" className="font-mono">
                                {log.action}
                              </Badge>
                            </td>

                            <td className="p-4">
                              <div className="text-white font-semibold">
                                {log.userId?.name || 'System'}
                              </div>
                              <div className="text-slate-500 font-mono text-[10px]">
                                {log.userId?.email || 'N/A'}
                              </div>
                            </td>

                            <td className="p-4 text-slate-300 font-medium">
                              {log.resource}
                              {log.resourceId && (
                                <span className="text-slate-500 text-[10px] block font-mono">
                                  #{log.resourceId.slice(-6)}
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-slate-400 font-mono text-[11px]">
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
                <h2 className="text-xl font-bold text-white">System Broadcast Notification</h2>
                <p className="text-xs text-slate-400">
                  Dispatch instant in-app alerts and notifications to students, recruiters, or all platform users.
                </p>
              </div>

              <Card className="border-slate-800 bg-slate-900/90 shadow-card">
                <CardContent className="p-6">
                  <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Target Audience
                      </label>
                      <select
                        value={broadcastForm.targetRole}
                        onChange={(e) =>
                          setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="ALL">All Platform Users (Students & Recruiters)</option>
                        <option value="STUDENT">Students Only</option>
                        <option value="RECRUITER">Recruiters Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                        className="w-full bg-rose-600 hover:bg-rose-500"
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
                <h2 className="text-xl font-bold text-white">Platform System Settings</h2>
                <p className="text-xs text-slate-400">
                  Global system parameters, security policies, and maintenance toggles.
                </p>
              </div>

              <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Public Student Registrations</h4>
                    <p className="text-xs text-slate-400">Allow new students to create accounts.</p>
                  </div>
                  <Badge variant="success" size="sm">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Recruiter Company Auto-Approval</h4>
                    <p className="text-xs text-slate-400">Require manual admin verification for new recruiters.</p>
                  </div>
                  <Badge variant="warning" size="sm">Manual Review</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">System Maintenance Mode</h4>
                    <p className="text-xs text-slate-400">Prevent non-admin logins during database migrations.</p>
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
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-72">
            {JSON.stringify(selectedAuditLog, null, 2)}
          </pre>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAuditLog(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
