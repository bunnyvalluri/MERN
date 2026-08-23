import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecruiterCandidateDetail,
  updateCandidateStatus,
  scheduleCandidateInterview,
  addCandidateNote,
} from '../applicationSlice.js';
import RecruiterNav from '../../recruiter/components/RecruiterNav.jsx';
import ApplicationTimeline from '../components/ApplicationTimeline.jsx';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Skeleton,
  ErrorState,
  Avatar,
  Textarea,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  GraduationCap,
  Calendar,
  Sparkles,
  UserCheck,
  XCircle,
  Clock,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  FileText,
  Video,
  Send,
  MessageSquare,
  Award,
  CheckCircle2,
  Eye,
} from 'lucide-react';

const STATUS_BADGE_VARIANTS = {
  APPLIED: 'primary',
  UNDER_REVIEW: 'secondary',
  SHORTLISTED: 'warning',
  INTERVIEW: 'info',
  SELECTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function CandidateDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    recruiterCandidateDetail,
    detailLoading: loading,
    actionLoading,
    error,
  } = useSelector((state) => state.applications);

  const [activeTab, setActiveTab] = useState('profile');
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchRecruiterCandidateDetail(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  const application = recruiterCandidateDetail?.application;
  const studentProfile = recruiterCandidateDetail?.studentProfile;
  const interviews = recruiterCandidateDetail?.interviews || [];
  const student = application?.studentId || {};
  const internship = application?.internshipId || {};

  const handleStatusChange = async (newStatus, note = '') => {
    const result = await dispatch(
      updateCandidateStatus({
        id: application._id,
        status: newStatus,
        note: note || `Candidate moved to ${newStatus.replace('_', ' ')}`,
      })
    );

    if (updateCandidateStatus.fulfilled.match(result)) {
      notify.success(`Status updated to ${newStatus.replace('_', ' ')}.`);
      dispatch(fetchRecruiterCandidateDetail(id));
    } else {
      notify.error(result.payload || 'Failed to update status.');
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    const result = await dispatch(
      scheduleCandidateInterview({
        id: application._id,
        interviewData,
      })
    );

    if (scheduleCandidateInterview.fulfilled.match(result)) {
      notify.success('Interview scheduled and invitation sent to candidate!');
      setInterviewModalOpen(false);
      dispatch(fetchRecruiterCandidateDetail(id));
    } else {
      notify.error(result.payload || 'Failed to schedule interview.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setAddingNote(true);
    try {
      const result = await dispatch(
        addCandidateNote({
          id: application._id,
          content: noteContent,
        })
      );
      if (addCandidateNote.fulfilled.match(result)) {
        notify.success('Internal review note added.');
        setNoteContent('');
        dispatch(fetchRecruiterCandidateDetail(id));
      } else {
        notify.error(result.payload || 'Failed to add note.');
      }
    } finally {
      setAddingNote(false);
    }
  };

  if (loading || (!application && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <RecruiterNav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <RecruiterNav />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <ErrorState
            title="Candidate application not found"
            message={error || 'The application you are trying to view does not exist or you do not have permission.'}
            action={
              <Link to="/recruiter/applications">
                <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to All Candidates
                </Button>
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  const badgeVariant = STATUS_BADGE_VARIANTS[application.status] || 'neutral';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      <RecruiterNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back navigation */}
        <div>
          <Link
            to="/recruiter/applications"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all candidates
          </Link>
        </div>

        {/* Candidate Banner Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Candidate Identity */}
            <div className="flex items-start gap-4">
              <Avatar
                name={student.name || 'Candidate'}
                src={student.avatar}
                size="lg"
                className="ring-2 ring-slate-700"
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {student.name || 'Anonymous Candidate'}
                  </h1>
                  {student.isVerified && (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  )}
                  <Badge variant={badgeVariant} size="sm">
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-300">
                  {studentProfile?.headline || 'Aspiring Software Engineering Intern'}
                </p>

                <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 pt-1">
                  <span className="text-slate-300 font-mono">{student.email}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-brand-300 font-semibold">
                    Role: {internship.title || 'Internship'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Recruiter Action Buttons Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
              {application.status !== 'UNDER_REVIEW' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('UNDER_REVIEW', 'Candidate profile under active review')}
                  leftIcon={<Eye className="w-4 h-4 text-purple-400" />}
                >
                  Under Review
                </Button>
              )}

              {application.status !== 'SHORTLISTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('SHORTLISTED', 'Candidate shortlisted for interview round')}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
                >
                  Shortlist
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                className="bg-teal-600 hover:bg-teal-500 text-white"
                onClick={() => setInterviewModalOpen(true)}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Schedule Interview
              </Button>

              {application.status !== 'SELECTED' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => handleStatusChange('SELECTED', 'Candidate selected and offer extended!')}
                  leftIcon={<UserCheck className="w-4 h-4" />}
                >
                  Accept & Select
                </Button>
              )}

              {application.status !== 'REJECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('REJECTED', 'Application not moving forward at this time')}
                  className="text-red-400 hover:bg-red-500/10 border-red-500/30"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Candidate Profile & Application
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'timeline'
                ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Application Timeline ({application.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'notes'
                ? 'bg-brand-500/10 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Review Notes ({application.notes?.length || 0})
          </button>
        </div>

        {/* Tab 1: Candidate Profile & Application Materials */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Candidate Deep-Dive */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Materials Card */}
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    Submitted Application Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Resume Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-sm">
                          {application.resume?.fileName || 'Candidate Resume.pdf'}
                        </p>
                        <p className="text-[11px] text-slate-400">Attached directly to this application</p>
                      </div>
                    </div>

                    {application.resume?.url && (
                      <a
                        href={application.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="primary" size="xs" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          View Full Resume
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter ? (
                    <div className="space-y-1.5 pt-2">
                      <h3 className="text-xs font-semibold text-slate-300">Candidate Cover Note:</h3>
                      <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-line">
                        {application.coverLetter}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No cover letter was submitted.</p>
                  )}
                </CardContent>
              </Card>

              {/* Education Section */}
              {studentProfile?.education && studentProfile.education.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-brand-400" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {studentProfile.education.map((edu, idx) => (
                      <div key={idx} className="space-y-1 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-white">{edu.institution}</h3>
                            <p className="text-xs text-slate-300">
                              {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                            </p>
                          </div>
                          {edu.gpa && (
                            <Badge variant="secondary" size="xs">
                              GPA: {edu.gpa}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} -{' '}
                          {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Experience Section */}
              {studentProfile?.experience && studentProfile.experience.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {studentProfile.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1.5 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                        <h3 className="text-sm font-bold text-white">{exp.role}</h3>
                        <p className="text-xs text-slate-400 font-medium">{exp.company}</p>
                        {exp.description && (
                          <p className="text-xs text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects Section */}
              {studentProfile?.projects && studentProfile.projects.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Key Projects & Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {studentProfile.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-2 pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                            >
                              <span>Demo/Repo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Skills, Links, & Interviews */}
            <div className="space-y-6">
              {/* Skills Card */}
              {studentProfile?.skills && studentProfile.skills.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-white">Skills & Competencies</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {studentProfile.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social & Portfolio Links */}
              {studentProfile?.socialLinks && (
                <Card className="border-slate-800 bg-slate-900/80">
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-white">Social & Code Profiles</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-2.5">
                    {studentProfile.socialLinks.github && (
                      <a
                        href={studentProfile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-brand-300 p-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
                      >
                        <Github className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{studentProfile.socialLinks.github}</span>
                      </a>
                    )}
                    {studentProfile.socialLinks.linkedin && (
                      <a
                        href={studentProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-brand-300 p-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{studentProfile.socialLinks.linkedin}</span>
                      </a>
                    )}
                    {studentProfile.socialLinks.portfolio && (
                      <a
                        href={studentProfile.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-brand-300 p-2 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
                      >
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span className="truncate">{studentProfile.socialLinks.portfolio}</span>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Scheduled Interviews Card */}
              {interviews.length > 0 && (
                <Card className="border-teal-500/30 bg-teal-950/20 shadow-card">
                  <CardHeader className="pb-3 border-b border-teal-500/20">
                    <CardTitle className="text-sm font-bold text-teal-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      Scheduled Interviews ({interviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {interviews.map((int, i) => (
                      <div key={int._id || i} className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/20 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <Badge variant="info" size="xs">
                            {int.type}
                          </Badge>
                          <span className="text-slate-400 font-mono">{int.durationMinutes} mins</span>
                        </div>
                        <p className="font-bold text-white">
                          {new Date(int.scheduledAt).toLocaleString()}
                        </p>
                        {int.meetingLink && (
                          <a
                            href={int.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch Meeting</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Application Timeline */}
        {activeTab === 'timeline' && (
          <Card className="border-slate-800 bg-slate-900/80">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                Candidate Application History & Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-w-3xl">
              <ApplicationTimeline timeline={application.timeline || []} />
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Team Review Notes */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Notes Thread */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-slate-800 bg-slate-900/80">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-400" />
                    Internal Hiring Team Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {(!application.notes || application.notes.length === 0) ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      No internal review notes added yet. Use the form to leave feedback for your hiring team.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {application.notes.map((n, idx) => (
                        <div key={n._id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">
                              {n.authorId?.name || 'Recruiter'}
                            </span>
                            <span className="text-slate-500">
                              {new Date(n.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {n.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add Note Form */}
            <div>
              <Card className="border-slate-800 bg-slate-900/90 shadow-card">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-sm font-bold text-white">Add Review Note</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <Textarea
                      placeholder="Enter private review feedback, coding interview score, or hiring recommendations..."
                      rows={4}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      required
                    />
                    <Button
                      variant="primary"
                      fullWidth
                      size="sm"
                      type="submit"
                      isLoading={addingNote}
                      loadingText="Saving..."
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Save Internal Note
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        onConfirm={handleScheduleInterview}
        candidateName={student.name || 'Candidate'}
        internshipTitle={internship.title || 'Internship'}
        isSubmitting={actionLoading}
      />
    </div>
  );
}

export default CandidateDetailPage;
