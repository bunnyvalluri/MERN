import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile } from '../studentSlice.js';
import { fetchStudentApplications } from '../../applications/applicationSlice.js';
import StudentNav from '../components/StudentNav.jsx';
import ProfileCompletionCard from '../components/ProfileCompletionCard.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
} from '../../../components/ui/index.js';
import {
  Briefcase,
  Eye,
  Calendar,
  Bookmark,
  ArrowRight,
  FileText,
  UserCheck,
  Search,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { profile, completion, loading } = useSelector((state) => state.student);
  const { studentApplications } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchStudentApplications({ limit: 4 }));
  }, [dispatch]);

  const appCount = studentApplications?.total || 0;
  const recentApps = studentApplications?.data || [];

  const stats = [
    {
      label: 'Applications',
      value: String(appCount),
      change: appCount > 0 ? `${appCount} active application(s)` : 'Apply to open roles',
      icon: <Briefcase className="w-5 h-5 text-brand-400" />,
      link: '/student/applications',
    },
    {
      label: 'Profile Views',
      value: '12',
      change: '+4 this week',
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: 'Interviews',
      value: String(recentApps.filter((a) => a.status === 'INTERVIEW').length),
      change: 'Scheduled calls',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      link: '/student/applications?status=INTERVIEW',
    },
    {
      label: 'Saved Jobs',
      value: '0',
      change: 'Bookmarked roles',
      icon: <Bookmark className="w-5 h-5 text-indigo-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              {user?.isVerified ? (
                <Badge variant="success" size="sm" className="hidden sm:inline-flex">
                  Verified Student
                </Badge>
              ) : (
                <Link to="/verify-email">
                  <Badge variant="warning" size="sm" className="cursor-pointer">
                    Verify Email
                  </Badge>
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {profile?.headline || 'Setup your profile to discover top software engineering internships.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/student/profile">
              <Button variant="outline" size="sm" leftIcon={<UserCheck className="w-4 h-4" />}>
                Edit Profile
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse Internships
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-slate-800 bg-slate-900/80">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {stat.icon}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                  <p className="text-[11px] text-slate-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid: Profile Strength + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Profile Strength & Resume Status */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <ProfileCompletionCard
                completion={completion}
                onActionClick={() => navigate('/student/profile')}
              />
            )}

            {/* Recent Applications Card */}
            {recentApps.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-400" />
                      <CardTitle className="text-sm font-bold text-white">Recent Applications</CardTitle>
                    </div>
                    <Link to="/student/applications">
                      <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View All ({appCount})
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {recentApps.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          to={`/student/applications/${app._id}`}
                          className="text-xs sm:text-sm font-bold text-white hover:text-brand-300 transition-colors truncate block"
                        >
                          {app.internshipId?.title || 'Internship'}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate">
                          {app.companyId?.name || 'Company'} • Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            app.status === 'SELECTED'
                              ? 'success'
                              : app.status === 'INTERVIEW'
                              ? 'info'
                              : app.status === 'SHORTLISTED'
                              ? 'warning'
                              : app.status === 'REJECTED'
                              ? 'danger'
                              : 'primary'
                          }
                          size="xs"
                        >
                          {app.status.replace('_', ' ')}
                        </Badge>
                        <Link to={`/student/applications/${app._id}`}>
                          <ChevronRight className="w-4 h-4 text-slate-500 hover:text-white" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Resume Summary Card */}
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <CardTitle className="text-sm font-bold text-white">Active Resume</CardTitle>
                  </div>
                  <Link to="/student/resume">
                    <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {profile?.resume?.url ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                          {profile.resume.fileName || 'Resume.pdf'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Uploaded {profile.resume.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={profile.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      View PDF
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-300">No Resume Uploaded</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Upload your resume to enable 1-click applications to top companies.
                      </p>
                    </div>
                    <Link to="/student/resume">
                      <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                        Upload Resume (+10%)
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Quick Recommendations & Internships Preview */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/80">
              <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <CardTitle className="text-sm font-bold text-white">Career Checklist</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-200">1. Verify Skills</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Add verified tags like React, Python, or Go to match recruiter filters.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-200">2. Link GitHub / Portfolio</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Profiles with live project links receive 3.5x more interview invitations.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-200">3. Set Internship Preferences</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Specify whether you want Remote, Hybrid, or On-site opportunities.
                  </p>
                </div>

                <Link to="/student/profile" className="block pt-2">
                  <Button variant="outline" fullWidth size="sm">
                    Complete Profile Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
