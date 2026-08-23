import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecruiterInternships,
  publishInternship,
  unpublishInternship,
  closeInternship,
  deleteInternship,
  setRecruiterFilters,
  setRecruiterPage,
} from '../recruiterSlice.js';
import RecruiterNav from '../components/RecruiterNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Modal,
  Pagination,
  Skeleton,
  EmptyState,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Briefcase,
  PlusCircle,
  Search,
  Users,
  Eye,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Postings' },
  { id: 'PUBLISHED', label: 'Published' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'CLOSED', label: 'Closed' },
  { id: 'EXPIRED', label: 'Expired' },
];

export function RecruiterInternshipsPage() {
  const dispatch = useDispatch();
  const { internships, pagination, filters, loading } = useSelector(
    (state) => state.recruiter
  );

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [closeModal, setCloseModal] = useState({ open: false, item: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchRecruiterInternships({ ...filters, page: filters.page }));
  }, [dispatch, filters]);

  const handleTabChange = (status) => {
    dispatch(setRecruiterFilters({ status }));
  };

  const handleSearchChange = (e) => {
    dispatch(setRecruiterFilters({ search: e.target.value }));
  };

  const handlePageChange = (page) => {
    dispatch(setRecruiterPage(page));
  };

  const handlePublish = async (item) => {
    const result = await dispatch(publishInternship(item._id));
    if (publishInternship.fulfilled.match(result)) {
      notify.success('Internship published successfully!');
    } else {
      notify.error(result.payload || 'Failed to publish.');
    }
  };

  const handleUnpublish = async (item) => {
    const result = await dispatch(unpublishInternship(item._id));
    if (unpublishInternship.fulfilled.match(result)) {
      notify.info('Internship reverted to draft.');
    } else {
      notify.error(result.payload || 'Failed to unpublish.');
    }
  };

  const handleConfirmClose = async () => {
    if (!closeModal.item) return;
    setActionLoading(true);
    try {
      const result = await dispatch(closeInternship(closeModal.item._id));
      if (closeInternship.fulfilled.match(result)) {
        notify.success('Internship closed. No new applications will be accepted.');
        setCloseModal({ open: false, item: null });
      } else {
        notify.error(result.payload || 'Failed to close internship.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    setActionLoading(true);
    try {
      const result = await dispatch(deleteInternship(deleteModal.item._id));
      if (deleteInternship.fulfilled.match(result)) {
        notify.success('Internship deleted successfully.');
        setDeleteModal({ open: false, item: null });
      } else {
        notify.error(result.payload || 'Failed to delete.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (item) => {
    if (item.isExpired) {
      return (
        <Badge variant="neutral" size="sm">
          Expired
        </Badge>
      );
    }
    switch (item.status) {
      case 'PUBLISHED':
        return (
          <Badge variant="success" size="sm">
            Published
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge variant="danger" size="sm">
            Closed
          </Badge>
        );
      case 'DRAFT':
      default:
        return (
          <Badge variant="warning" size="sm">
            Draft
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <RecruiterNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Manage Internship Postings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Create, edit, publish, or close your company&apos;s internship listings.
            </p>
          </div>

          <Link to="/recruiter/internships/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create New Role
            </Button>
          </Link>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const isSelected = filters.status === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-64">
            <Input
              placeholder="Search by role title..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Table / List Container */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-card overflow-hidden">
          <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-300">
              Showing {internships.length} of {pagination.total} postings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800/80">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : internships.length === 0 ? (
              <div className="p-12 text-center">
                <EmptyState
                  icon={<Briefcase className="w-8 h-8 text-brand-400" />}
                  title="No internship postings found"
                  description="No listings match your selected status tab or search query."
                  action={
                    <Link to="/recruiter/internships/new">
                      <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                        Post Internship Now
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              internships.map((item) => (
                <div
                  key={item._id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                >
                  {/* Left Role Details */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      {getStatusBadge(item)}
                      <span className="text-xs text-slate-400 font-mono">
                        {item.remote || 'Remote'} • {item.type === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 text-purple-400 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {item.applicationsCount || 0} Candidates
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Eye className="w-3.5 h-3.5" />
                        {item.viewsCount || 0} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Deadline:{' '}
                        {item.applicationDeadline
                          ? new Date(item.applicationDeadline).toLocaleDateString()
                          : 'N/A'}
                      </span>
                      <span className="text-slate-500">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap self-start lg:self-auto shrink-0">
                    {/* Public Preview */}
                    <Link
                      to={`/internships/${item._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View public posting"
                    >
                      <Button variant="ghost" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>

                    {/* Edit */}
                    <Link to={`/recruiter/internships/${item._id}/edit`}>
                      <Button variant="outline" size="xs" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                    </Link>

                    {/* Publish / Unpublish Toggle */}
                    {item.status === 'PUBLISHED' ? (
                      <Button
                        variant="secondary"
                        size="xs"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleUnpublish(item)}
                      >
                        Unpublish
                      </Button>
                    ) : item.status === 'DRAFT' ? (
                      <Button
                        variant="primary"
                        size="xs"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handlePublish(item)}
                      >
                        Publish
                      </Button>
                    ) : null}

                    {/* Close Role */}
                    {item.status === 'PUBLISHED' && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-amber-400 hover:text-amber-300"
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                        onClick={() => setCloseModal({ open: true, item })}
                      >
                        Close
                      </Button>
                    )}

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteModal({ open: true, item })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>

      {/* Confirmation Modal: Close Internship */}
      <Modal
        isOpen={closeModal.open}
        onClose={() => setCloseModal({ open: false, item: null })}
        title="Close Internship Opportunity"
        description={`Are you sure you want to close "${closeModal.item?.title}"? Closed internships will immediately stop accepting student applications.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => setCloseModal({ open: false, item: null })}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={actionLoading} onClick={handleConfirmClose}>
            Yes, Close Internship
          </Button>
        </div>
      </Modal>

      {/* Confirmation Modal: Delete Internship */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Internship Posting"
        description={`Are you sure you want to permanently delete "${deleteModal.item?.title}"? This action cannot be undone and will be recorded in the audit log.`}
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, item: null })}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={actionLoading} onClick={handleConfirmDelete}>
            Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default RecruiterInternshipsPage;
