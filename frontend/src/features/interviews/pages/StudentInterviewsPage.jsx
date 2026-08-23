import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchStudentInterviews } from '../interviewSlice.js';
import CalendarView from '../components/CalendarView.jsx';
import StudentNav from '../../student/components/StudentNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Breadcrumbs,
} from '../../../components/ui/index.js';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  List,
  CalendarDays,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export function StudentInterviewsPage() {
  const dispatch = useDispatch();
  const { studentInterviews, loading } = useSelector((state) => state.interviews);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [timeframe, setTimeframe] = useState('upcoming'); // 'upcoming' | 'past' | 'all'

  useEffect(() => {
    dispatch(fetchStudentInterviews({ timeframe }));
  }, [dispatch, timeframe]);

  const interviewsList = studentInterviews?.data || [];
  const nextInterview = interviewsList.find(
    (i) => i.status !== 'CANCELLED' && new Date(i.scheduledAt).getTime() >= Date.now()
  );

  // Helper for human-readable countdown
  const getCountdownString = (dateStr) => {
    const diffMs = new Date(dateStr).getTime() - Date.now();
    if (diffMs < 0) return 'Concluded';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `In ${diffMins} minutes`;
      }
      return `Today in ${diffHours} hour(s)`;
    }
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/20 selection:text-brand-300">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: 'Student Hub', path: '/student/dashboard' },
              { label: 'My Interviews', active: true },
            ]}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Calendar className="w-7 h-7 text-teal-400" />
                My Interview Schedule
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                View your upcoming technical interviews, video calls, meeting links, and recruiter notes.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Hero Spotlight: Next Immediate Interview */}
        {nextInterview && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900/30 via-slate-900 to-slate-900 border border-teal-500/30 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  Upcoming Next: {getCountdownString(nextInterview.scheduledAt)}
                </span>
                <Badge variant="info" size="sm">
                  {nextInterview.type}
                </Badge>
              </div>

              <span className="text-xs font-mono text-slate-400">
                {new Date(nextInterview.scheduledAt).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {nextInterview.internshipId?.title || 'Technical Interview'}
                </h2>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {nextInterview.companyId?.name || 'Company'}
                  </span>
                  <span>•</span>
                  <span>{nextInterview.durationMinutes || 45} mins</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {nextInterview.meetingLink ? (
                  <a
                    href={nextInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={<Video className="w-5 h-5" />}
                      className="shadow-lg shadow-teal-500/20 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                    >
                      Join Video Meeting
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Meeting link will appear prior to call</span>
                )}
              </div>
            </div>

            {/* Recruiter Preparation Notes */}
            {nextInterview.notes && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                  Candidate Preparation Notes
                </span>
                <p className="leading-relaxed">{nextInterview.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'upcoming', label: 'Upcoming Interviews', count: studentInterviews?.upcomingCount },
            { id: 'past', label: 'Past Interviews', count: studentInterviews?.pastCount },
            { id: 'all', label: 'All History', count: studentInterviews?.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-slate-400 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content View Modes */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView interviews={interviewsList} />
        ) : interviewsList.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/60 py-16">
            <CardContent>
              <EmptyState
                icon={<Calendar className="w-12 h-12 text-slate-600 mx-auto" />}
                title={
                  timeframe === 'upcoming'
                    ? 'No upcoming interviews'
                    : 'No interview history found'
                }
                description="When recruiters shortlist your application and invite you to an interview, your schedule and meeting links will appear here."
                action={
                  <Link to="/internships">
                    <Button variant="primary" size="sm">
                      Explore Internships
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviewsList.map((item) => (
              <div
                key={item._id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0 font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {item.internshipId?.title || 'Internship Interview'}
                      </h3>
                      <Badge
                        variant={
                          item.status === 'COMPLETED'
                            ? 'success'
                            : item.status === 'CANCELLED'
                            ? 'danger'
                            : item.status === 'RESCHEDULED'
                            ? 'warning'
                            : 'info'
                        }
                        size="xs"
                      >
                        {item.status}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {item.companyId?.name || 'Organization'} •{' '}
                      {item.durationMinutes || 45} mins
                    </p>

                    <div className="flex items-center gap-2 text-xs font-mono text-teal-400 pt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.scheduledAt).toLocaleString()}</span>
                      <span className="text-slate-500">
                        ({getCountdownString(item.scheduledAt)})
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mt-2">
                        <strong className="text-slate-400 block text-[10px] uppercase">
                          Preparation Notes:
                        </strong>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.meetingLink && item.status !== 'CANCELLED' && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Video className="w-4 h-4" />}
                      >
                        Join Call
                      </Button>
                    </a>
                  )}

                  <Link to={`/student/applications/${item.applicationId}`}>
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Application
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentInterviewsPage;
