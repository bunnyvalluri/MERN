import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, updateStudentProfile } from '../studentSlice.js';
import StudentNav from '../components/StudentNav.jsx';
import EducationModal from '../components/EducationModal.jsx';
import ExperienceModal from '../components/ExperienceModal.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import CertificationModal from '../components/CertificationModal.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Avatar,
  Skeleton,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  ExternalLink,
  Tag,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'Go',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Tailwind CSS',
  'GraphQL',
  'Git',
  'Next.js',
  'Express.js',
  'REST APIs',
];

export function StudentProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading, saving } = useSelector((state) => state.student);

  // Form State
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    phone: '',
    location: { city: '', state: '', country: '' },
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    portfolio: '',
    github: '',
    linkedin: '',
    preferences: {
      desiredRoles: [],
      targetLocations: [],
      remotePreference: 'FLEXIBLE',
      expectedStipend: { amount: 0, currency: 'USD', period: 'MONTH' },
    },
  });

  const [newSkill, setNewSkill] = useState('');

  // Modals state
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);

  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: {
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          country: profile.location?.country || '',
        },
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        projects: profile.projects || [],
        certifications: profile.certifications || [],
        portfolio: profile.portfolio || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        preferences: {
          desiredRoles: profile.preferences?.desiredRoles || [],
          targetLocations: profile.preferences?.targetLocations || [],
          remotePreference: profile.preferences?.remotePreference || 'FLEXIBLE',
          expectedStipend: {
            amount: profile.preferences?.expectedStipend?.amount || 0,
            currency: profile.preferences?.expectedStipend?.currency || 'USD',
            period: profile.preferences?.expectedStipend?.period || 'MONTH',
          },
        },
      });
    }
  }, [profile]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [name]: value },
    }));
  };

  // Skill Handlers
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkill).trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      notify.error(`Skill "${trimmed}" is already in your list.`);
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Education Handlers
  const handleSaveEducation = (edu) => {
    setFormData((prev) => {
      const exists = prev.education.some((item) => item._id === edu._id);
      return {
        ...prev,
        education: exists
          ? prev.education.map((item) => (item._id === edu._id ? edu : item))
          : [...prev.education, edu],
      };
    });
    notify.success('Education saved.');
  };

  const handleDeleteEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    notify.info('Education entry removed.');
  };

  // Experience Handlers
  const handleSaveExperience = (exp) => {
    setFormData((prev) => {
      const exists = prev.experience.some((item) => item._id === exp._id);
      return {
        ...prev,
        experience: exists
          ? prev.experience.map((item) => (item._id === exp._id ? exp : item))
          : [...prev.experience, exp],
      };
    });
    notify.success('Experience saved.');
  };

  const handleDeleteExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
    notify.info('Experience entry removed.');
  };

  // Project Handlers
  const handleSaveProject = (proj) => {
    setFormData((prev) => {
      const exists = prev.projects.some((item) => item._id === proj._id);
      return {
        ...prev,
        projects: exists
          ? prev.projects.map((item) => (item._id === proj._id ? proj : item))
          : [...prev.projects, proj],
      };
    });
    notify.success('Project saved.');
  };

  const handleDeleteProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    notify.info('Project removed.');
  };

  // Certification Handlers
  const handleSaveCert = (cert) => {
    setFormData((prev) => {
      const exists = prev.certifications.some((item) => item._id === cert._id);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.map((item) => (item._id === cert._id ? cert : item))
          : [...prev.certifications, cert],
      };
    });
    notify.success('Certification saved.');
  };

  const handleDeleteCert = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
    notify.info('Certification removed.');
  };

  // Global Save
  const handleGlobalSubmit = async (e) => {
    if (e) e.preventDefault();
    const result = await dispatch(updateStudentProfile(formData));
    if (updateStudentProfile.fulfilled.match(result)) {
      notify.success('Profile updated successfully!');
    } else {
      notify.error(result.payload || 'Failed to update profile.');
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <StudentNav />
        <main className="max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <StudentNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Profile Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/80 border border-slate-800 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || 'Student'} size="xl" className="border-2 border-brand-500/40" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
                <Badge variant={user?.isVerified ? 'success' : 'neutral'} size="sm">
                  {user?.isVerified ? 'Verified Student' : 'Unverified Email'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-brand-300 font-medium">
                {formData.headline || 'Add a headline (e.g. CS Sophomore @ Stanford)'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {formData.location.city ? `${formData.location.city}, ${formData.location.country}` : 'Location unset'}
                </span>
                <span>•</span>
                <span>{formData.skills.length} Skills Added</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            isLoading={saving}
            loadingText="Saving..."
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleGlobalSubmit}
          >
            Save Changes
          </Button>
        </div>

        {/* 1. Basic Information Card */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              label="Professional Headline"
              name="headline"
              placeholder="e.g. Computer Science Junior | Frontend Engineer | React & TypeScript"
              value={formData.headline}
              onChange={handleBasicChange}
              helperText="Summarize your academic background and key focus area in one sentence."
            />

            <Textarea
              label="Professional Bio / Summary"
              name="bio"
              rows={4}
              placeholder="Tell hiring teams about your background, career interests, and what you are passionate about..."
              value={formData.bio}
              onChange={handleBasicChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                name="phone"
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={handleBasicChange}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="City"
                  name="city"
                  placeholder="San Francisco"
                  value={formData.location.city}
                  onChange={handleLocationChange}
                />
                <Input
                  label="Country"
                  name="country"
                  placeholder="United States"
                  value={formData.location.country}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Technical Skills Card */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-400" />
                <CardTitle className="text-sm font-bold text-white">Technical Skills ({formData.skills.length})</CardTitle>
              </div>
              <span className="text-xs text-slate-400">Aim for at least 3 skills for optimal matching</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Input Adder */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Add (e.g. Python, Docker, Next.js)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button variant="secondary" size="md" onClick={() => handleAddSkill()} leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            {/* Active Skills List */}
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-400 transition-colors p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No skills added yet.</p>
            )}

            {/* Suggested Skills */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Suggested Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Education Section */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Education</CardTitle>
            </div>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingEducation(null);
                setEducationModalOpen(true);
              }}
            >
              Add Education
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {formData.education.length > 0 ? (
              formData.education.map((edu, idx) => (
                <div
                  key={edu._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{edu.institution}</h4>
                    <p className="text-xs text-brand-300 font-medium">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} -{' '}
                      {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEducation(edu);
                        setEducationModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No education history added yet. Click &quot;Add Education&quot; to add your degree.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Experience Section */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Work Experience</CardTitle>
            </div>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingExperience(null);
                setExperienceModalOpen(true);
              }}
            >
              Add Experience
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {formData.experience.length > 0 ? (
              formData.experience.map((exp, idx) => (
                <div
                  key={exp._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                    <p className="text-xs text-brand-300 font-medium">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    <p className="text-[11px] text-slate-400">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''} -{' '}
                      {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-300 pt-1 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExperience(exp);
                        setExperienceModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No work or internship experience added yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Projects Section */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Projects & Engineering Portfolio</CardTitle>
            </div>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingProject(null);
                setProjectModalOpen(true);
              }}
            >
              Add Project
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {formData.projects.length > 0 ? (
              formData.projects.map((proj, idx) => (
                <div
                  key={proj._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-brand-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-white"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(proj);
                        setProjectModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No technical projects added yet. Add a project to highlight your capabilities.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6. Certifications Section */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Certifications & Licenses</CardTitle>
            </div>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditingCert(null);
                setCertModalOpen(true);
              }}
            >
              Add Certification
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {formData.certifications.length > 0 ? (
              formData.certifications.map((cert, idx) => (
                <div
                  key={cert._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{cert.name}</h4>
                    <p className="text-xs text-brand-300">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-[11px] font-mono text-slate-500">ID: {cert.credentialId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCert(cert);
                        setCertModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No certifications added yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7. Social & Online Links */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm font-bold text-white">Online Profiles & Social Links</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Input
              label="Portfolio Website URL"
              name="portfolio"
              leftIcon={<Globe className="w-4 h-4" />}
              placeholder="https://yourportfolio.dev"
              value={formData.portfolio}
              onChange={handleBasicChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GitHub Profile URL"
                name="github"
                leftIcon={<Github className="w-4 h-4" />}
                placeholder="https://github.com/yourhandle"
                value={formData.github}
                onChange={handleBasicChange}
              />

              <Input
                label="LinkedIn Profile URL"
                name="linkedin"
                leftIcon={<Linkedin className="w-4 h-4" />}
                placeholder="https://linkedin.com/in/yourhandle"
                value={formData.linkedin}
                onChange={handleBasicChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            isLoading={saving}
            loadingText="Saving profile..."
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleGlobalSubmit}
          >
            Save All Profile Changes
          </Button>
        </div>
      </main>

      {/* Subdocument Modals */}
      <EducationModal
        isOpen={educationModalOpen}
        onClose={() => setEducationModalOpen(false)}
        onSave={handleSaveEducation}
        initialData={editingEducation}
      />

      <ExperienceModal
        isOpen={experienceModalOpen}
        onClose={() => setExperienceModalOpen(false)}
        onSave={handleSaveExperience}
        initialData={editingExperience}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      <CertificationModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        onSave={handleSaveCert}
        initialData={editingCert}
      />
    </div>
  );
}

export default StudentProfilePage;
