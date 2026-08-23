import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Applications' },
  { key: 'APPLIED', label: 'Applied' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'SELECTED', label: 'Accepted' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'WITHDRAWN', label: 'Withdrawn' },
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

export function StudentApplicationsPage() {
  const dispatch = useDispatch();
  const { studentApplications, loading, actionLoading } = useSelector(
    (state) => state.applications
  );

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawTargetId, setWithdrawTargetId] = useState(null);

  useEffect(() => {
    dispatch(
      fetchStudentApplications({
        status: selectedStatus,
        page: currentPage,
        limit: 8,
      })
    );
  }, [dispatch, selectedStatus, currentPage]);

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
      dispatch(
        fetchStudentApplications({
          status: selectedStatus,
          page: currentPage,
          limit: 8,
        })
      );
    } else {
      notify.error(result.payload || 'Failed to withdraw application.');
    }
  };

  const applications = studentApplications?.data || [];
  const total = studentApplications?.total || 0;
  const totalPages = studentApplications?.totalPages || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                My Applications
              </h1>
              <Badge variant="primary" size="sm">
                {total} Total
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Track the real-time review progress, interview calls, and hiring decisions for your applications.
            </p>
          </div>

          <Link to="/internships">
            <Button variant="primary" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              Explore Internships
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-xs ${
                selectedStatus === tab.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-slate-200 bg-white py-12 shadow-sm">
            <CardContent>
              <EmptyState
                icon={<Briefcase className="w-12 h-12 text-slate-400 mx-auto" />}
                title={
                  selectedStatus === 'ALL'
                    ? 'No applications submitted yet'
                    : `No applications with status "${selectedStatus.replace('_', ' ')}"`
                }
                description="Explore top software engineering internships and start applying with your verified resume."
                action={
                  <Link to="/internships">
                    <Button variant="primary" size="sm">
                      Browse Internships
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const internship = app.internshipId || {};
              const company = app.companyId || {};
              const badgeVariant = STATUS_BADGE_VARIANTS[app.status] || 'neutral';
              const canWithdraw = !['WITHDRAWN', 'REJECTED', 'SELECTED'].includes(app.status);

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
                <div
                  key={app._id}
                  className="bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all shadow-sm group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* Left: Company & Role Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${company.name} logo`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="w-7 h-7 text-brand-600" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-600">
                            {company.name || 'Company'}
                          </span>
                          {company.verified && (
                            <Badge variant="primary" size="sm">
                              Verified
                            </Badge>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          to={`/student/applications/${app._id}`}
                          className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors inline-block"
                        >
                          {internship.title || 'Internship Opportunity'}
                        </Link>

                        {/* Metadata pills */}
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {internship.remote || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {internship.duration || '3 Months'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <strong className="text-slate-900">{stipendText}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status badge & Actions */}
                    <div className="flex sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant} size="md">
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {canWithdraw && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setWithdrawTargetId(app._id)}
                            className="text-slate-500 hover:text-red-600"
                          >
                            Withdraw
                          </Button>
                        )}
                        <Link to={`/student/applications/${app._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                          >
                            View Timeline
                          </Button>
                        </Link>
                      </div>
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
