import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecruiterInternships,
  fetchCompanyProfile,
  publishInternship,
  unpublishInternship,
} from '../recruiterSlice.js';
import RecruiterNav from '../components/RecruiterNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Briefcase,
  Users,
  Eye,
  CheckCircle2,
  PlusCircle,
  Building2,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  Edit,
} from 'lucide-react';

export function RecruiterDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { internships, company, loading } = useSelector((state) => state.recruiter);

  useEffect(() => {
    dispatch(fetchRecruiterInternships({ limit: 5 }));
    dispatch(fetchCompanyProfile());
  }, [dispatch]);

  // Compute aggregate metrics
  const totalPostings = internships.length;
  const publishedPostings = internships.filter((i) => i.status === 'PUBLISHED').length;
  const totalApplications = internships.reduce((acc, i) => acc + (i.applicationsCount || 0), 0);
  const totalViews = internships.reduce((acc, i) => acc + (i.viewsCount || 0), 0);

  const handleToggleStatus = async (item) => {
    if (item.status === 'PUBLISHED') {
      const result = await dispatch(unpublishInternship(item._id));
      if (unpublishInternship.fulfilled.match(result)) {
        notify.info('Internship reverted to draft.');
      } else {
        notify.error(result.payload || 'Failed to update status.');
      }
    } else {
      const result = await dispatch(publishInternship(item._id));
      if (publishInternship.fulfilled.match(result)) {
        notify.success('Internship published successfully! Now visible on public discovery.');
      } else {
        notify.error(result.payload || 'Failed to publish internship.');
      }
    }
  };

  const getStatusBadge = (status, isExpired) => {
    if (isExpired) return <Badge variant="neutral" size="sm">Expired</Badge>;
    if (status === 'PUBLISHED') return <Badge variant="success" size="sm">Published</Badge>;
    if (status === 'CLOSED') return <Badge variant="danger" size="sm">Closed</Badge>;
    return <Badge variant="warning" size="sm">Draft</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <RecruiterNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Recruiter Portal
              </h1>
              <Badge variant="primary" size="sm">
                {company?.name || 'Company'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Welcome back, <strong className="text-slate-200">{user?.name}</strong>. Manage your recruitment pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/recruiter/internships/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Post New Role
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Postings</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{totalPostings}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Created across all statuses</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Roles</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{publishedPostings}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Live on public discovery</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Applications</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{totalApplications}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Total candidate submissions</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Listing Views</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{totalViews}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Total candidate impressions</p>
          </Card>
        </div>

        {/* Quick Action Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Build a compelling company profile
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Adding your company logo, description, and website helps attract top university applicants and establishes verified recruiter status.
            </p>
          </div>
          <Link to="/recruiter/company">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Edit Company Profile
            </Button>
          </Link>
        </div>

        {/* Recent Postings List */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-card">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Recent Internship Postings</CardTitle>
            </div>
            <Link to="/recruiter/internships" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All ({totalPostings})
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800/80">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : internships.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No internships created yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Create your first internship posting to begin receiving qualified student applications.
                </p>
                <Link to="/recruiter/internships/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Create First Internship
                  </Button>
                </Link>
              </div>
            ) : (
              internships.map((item) => (
                <div
                  key={item._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate max-w-md">
                        {item.title}
                      </h4>
                      {getStatusBadge(item.status, item.isExpired)}
                      <span className="text-xs text-slate-500">• {item.remote || 'Remote'}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <strong>{item.applicationsCount || 0}</strong> Applicants
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <strong>{item.viewsCount || 0}</strong> Views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Deadline: {item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <Link to={`/internships/${item._id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Preview
                      </Button>
                    </Link>

                    <Link to={`/recruiter/internships/${item._id}/edit`}>
                      <Button variant="outline" size="xs" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant={item.status === 'PUBLISHED' ? 'secondary' : 'primary'}
                      size="xs"
                      onClick={() => handleToggleStatus(item)}
                    >
                      {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default RecruiterDashboard;
