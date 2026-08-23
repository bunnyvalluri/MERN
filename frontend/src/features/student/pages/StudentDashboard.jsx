import React, { useState, useEffect } from 'react';
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
import { REAL_INTERNSHIPS } from '../../internships/data/realInternships.js';
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
  TrendingUp,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Award,
} from 'lucide-react';

export function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { profile, completion, loading } = useSelector((state) => state.student);
  const { studentApplications } = useSelector((state) => state.applications);

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'matched' | 'deadlines'

  useEffect(() => {
    dispatch(fetchStudentProfile());
    dispatch(fetchStudentApplications({ limit: 6 }));
  }, [dispatch]);

  const appCount = studentApplications?.total || 3;
  const recentApps = (studentApplications?.data && studentApplications.data.length > 0)
    ? studentApplications.data
    : [
        {
          _id: 'app_demo_01',
          internshipId: REAL_INTERNSHIPS[0],
          companyId: REAL_INTERNSHIPS[0].companyId,
          status: 'INTERVIEW',
          createdAt: '2026-08-18T14:30:00.000Z',
        },
        {
          _id: 'app_demo_02',
          internshipId: REAL_INTERNSHIPS[4],
          companyId: REAL_INTERNSHIPS[4].companyId,
          status: 'UNDER_REVIEW',
          createdAt: '2026-08-19T16:00:00.000Z',
        },
        {
          _id: 'app_demo_03',
          internshipId: REAL_INTERNSHIPS[7],
          companyId: REAL_INTERNSHIPS[7].companyId,
          status: 'APPLIED',
          createdAt: '2026-08-21T18:00:00.000Z',
        },
      ];

  const interviewCount = recentApps.filter((a) => a.status === 'INTERVIEW').length;

  const stats = [
    {
      label: 'Active Applications',
      value: String(appCount),
      change: `${interviewCount} in interview stage`,
      icon: <Briefcase className="w-5 h-5 text-brand-600" />,
      link: '/student/applications',
      badgeText: 'Active',
      badgeVariant: 'primary',
    },
    {
      label: 'Recruiter Impressions',
      value: '28',
      change: '+14% vs last week',
      icon: <Eye className="w-5 h-5 text-emerald-600" />,
      link: '/student/profile',
      badgeText: '+14%',
      badgeVariant: 'success',
    },
    {
      label: 'Scheduled Interviews',
      value: String(interviewCount || 1),
      change: 'Next: Friday 2:00 PM',
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      link: '/student/interviews',
      badgeText: 'Upcoming',
      badgeVariant: 'warning',
    },
    {
      label: 'Saved Opportunities',
      value: '6',
      change: 'Open summer roles',
      icon: <Bookmark className="w-5 h-5 text-indigo-600" />,
      link: '/internships',
      badgeText: 'Curated',
      badgeVariant: 'info',
    },
  ];

  // Matched Opportunities based on real tech data
  const recommendedInternships = REAL_INTERNSHIPS.slice(0, 3);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/50 via-indigo-50/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {getGreeting()}, {user?.name || 'Jordan'}! 👋
                </h1>
                <Badge variant="success" size="sm" className="gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile?.headline ||
                  'CS Junior @ Stanford • Aspiring Full-Stack & Distributed Systems Engineer'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Stanford University
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  San Francisco, CA
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  Open to Summer 2026 Roles
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/student/profile">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<UserCheck className="w-4 h-4 text-slate-600" />}
                  className="bg-white hover:bg-slate-50"
                >
                  Edit Profile
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
                  Browse Internships
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats 4-Column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {stats.map((stat, idx) => (
            <Link
              key={idx}
              to={stat.link}
              className="group block p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-brand-600 transition-colors">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {stat.value}
                  </p>
                  <Badge variant={stat.badgeVariant} size="xs">
                    {stat.badgeText}
                  </Badge>
                </div>
                <p className="text-[11px] font-medium text-slate-500">{stat.change}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Main Content Workspace Grid (2/3 Left Main, 1/3 Right Command Bar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Main Workspace (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Workspace Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 pt-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className={`pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'applications'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>My Applications</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-700 font-mono">
                      {recentApps.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('matched')}
                    className={`pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'matched'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Recommended For You</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono">
                      98% Match
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('deadlines')}
                    className={`pb-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'deadlines'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Upcoming Deadlines</span>
                  </button>
                </div>

                <Link
                  to={activeTab === 'matched' ? '/internships' : '/student/applications'}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 pb-3.5 transition-colors"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Tab 1: Applications Content */}
              {activeTab === 'applications' && (
                <div className="p-4 sm:p-6 space-y-3">
                  {recentApps.map((app) => {
                    const internship = app.internshipId || {};
                    const company = app.companyId || {};

                    return (
                      <div
                        key={app._id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <img
                            src={
                              company.logo ||
                              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={company.name || 'Company'}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/student/applications/${app._id}`}
                                className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate block"
                              >
                                {internship.title || 'Software Engineering Intern'}
                              </Link>
                              {company.verified && (
                                <Badge variant="primary" size="xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
                              <span className="font-semibold text-slate-700">{company.name || 'Tech Corp'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                ${internship.stipend?.amount ? internship.stipend.amount.toLocaleString() : '9,200'}/mo
                              </span>
                              <span>•</span>
                              <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
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
                            size="sm"
                            className="font-bold uppercase tracking-wider text-[11px]"
                          >
                            {app.status.replace('_', ' ')}
                          </Badge>

                          <Link to={`/student/applications/${app._id}`}>
                            <Button
                              variant="ghost"
                              size="xs"
                              rightIcon={<ChevronRight className="w-4 h-4" />}
                              className="text-slate-600 hover:text-slate-900"
                            >
                              Timeline
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Matched Opportunities */}
              {activeTab === 'matched' && (
                <div className="p-4 sm:p-6 space-y-3">
                  {recommendedInternships.map((intItem) => (
                    <div
                      key={intItem._id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <img
                          src={intItem.companyId?.logo}
                          alt={intItem.companyId?.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/internships/${intItem._id}`}
                              className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate block"
                            >
                              {intItem.title}
                            </Link>
                            <Badge variant="success" size="xs">
                              98% Match
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="font-semibold text-slate-700">{intItem.companyId?.name}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">
                              ${intItem.stipend?.amount?.toLocaleString()}/mo
                            </span>
                            <span>•</span>
                            <span>{intItem.remote}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/internships/${intItem._id}`}>
                          <Button variant="primary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            1-Click Apply
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Deadlines */}
              {activeTab === 'deadlines' && (
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Google DeepMind ML Research Internship</span>
                    </div>
                    <span className="font-mono font-bold text-amber-800">Deadline: Oct 31, 2026</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>Stripe Core Payments SWE Internship</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700">Deadline: Nov 30, 2026</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>Microsoft Azure Tools Internship</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700">Deadline: Dec 01, 2026</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Completion / Readiness Card */}
            {loading ? (
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <ProfileCompletionCard
                completion={
                  completion || {
                    percentage: 85,
                    breakdown: {
                      basicInfo: { completed: true, weight: '20%' },
                      education: { completed: true, weight: '20%' },
                      skills: { completed: true, weight: '20%' },
                      experience: { completed: true, weight: '15%' },
                      projects: { completed: true, weight: '15%' },
                      resume: { completed: true, weight: '10%' },
                    },
                    nextSteps: ['Add GitHub project link', 'Specify graduation month'],
                  }
                }
                onActionClick={() => navigate('/student/profile')}
              />
            )}
          </div>

          {/* Right Column: Command Center & Vault Cards (1 Col) */}
          <div className="space-y-6">
            {/* Active Resume Vault Card */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">Verified Resume Vault</CardTitle>
                  </div>
                  <Badge variant="success" size="xs">
                    ATS Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                        {profile?.resume?.fileName || 'Jordan_Lee_Resume_2026.pdf'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Updated {profile?.resume?.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : 'Aug 2026'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={profile?.resume?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link to="/student/resume" className="w-full">
                    <Button variant="outline" size="sm" fullWidth className="text-xs">
                      Replace Resume
                    </Button>
                  </Link>
                  <Link to="/student/resume" className="w-full">
                    <Button variant="primary" size="sm" fullWidth className="text-xs">
                      ATS Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Live Screening Activity Feed */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">Live Recruiter Feed</CardTitle>
                  </div>
                  <Badge variant="info" size="xs" dot pulse>
                    Real-time
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Stripe Talent Team</span>
                    <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Reviewed your GitHub repositories and invited you to technical interview.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">OpenAI University Recruiting</span>
                    <span className="text-[10px] text-slate-400 font-mono">Yesterday</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Your profile matched requirements for AI Safety Engineering Intern.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tech Internship Compensation Transparency */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-400" />
                  Market Benchmarks
                </span>
                <Badge variant="primary" size="xs">
                  Summer 2026
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold font-mono text-white">$9,200 — $12,000 / mo</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Average compensation for Tier-1 SWE, Research, and Systems internships with housing stipend.
                </p>
              </div>
              <Link to="/internships" className="block pt-1">
                <Button variant="secondary" size="xs" fullWidth className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Explore High-Pay Roles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
