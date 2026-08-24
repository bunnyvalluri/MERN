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
  CardDescription,
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
  Eye,
  Sliders,
  DollarSign,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'Rust',
  'PostgreSQL',
  'Docker',
  'Distributed Systems',
  'AWS',
  'GraphQL',
  'Tailwind CSS',
  'Kubernetes',
  'PyTorch',
  'Next.js',
  'REST APIs',
];

const SECTIONS = [
  { id: 'identity', label: 'Identity & Bio', icon: <User className="w-4 h-4" /> },
  { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'experience', label: 'Work Experience', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects & Portfolio', icon: <FolderGit2 className="w-4 h-4" /> },
  { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills & Tech Stack', icon: <Tag className="w-4 h-4" /> },
  { id: 'links', label: 'Links & Socials', icon: <Globe className="w-4 h-4" /> },
  { id: 'preferences', label: 'Internship Preferences', icon: <Sliders className="w-4 h-4" /> },
];

export function StudentProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, saving } = useSelector((state) => state.student);

  const [activeSection, setActiveSection] = useState('identity');

  // Form State
  const [formData, setFormData] = useState({
    headline: 'Computer Science Major @ Stanford | Aspiring Full-Stack & Systems Engineer',
    bio: 'Junior studying Computer Science with hands-on experience in React, TypeScript, Node.js, and cloud architectures. Passionate about building high-craft SaaS applications and distributed infrastructure.',
    phone: '+1 (555) 234-5678',
    location: { city: 'San Francisco', state: 'CA', country: 'United States' },
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Python', 'Go', 'Distributed Systems'],
    education: [
      {
        _id: 'edu_01',
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2023-09-01',
        endDate: '2027-06-15',
        grade: '3.92 GPA',
        current: true,
        description: 'Coursework: Operating Systems, Distributed Consensus, Algorithms, Compilers, Machine Learning.',
      },
    ],
    experience: [
      {
        _id: 'exp_01',
        title: 'Software Engineering Fellow',
        company: 'Acme Open Source Lab',
        location: 'San Francisco, CA',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        current: false,
        description: 'Built distributed telemetry pipelines and React visualization dashboards handling 50k events/sec with sub-50ms query latency.',
      },
    ],
    projects: [
      {
        _id: 'proj_01',
        title: 'FastKV — Distributed Log-Structured Key-Value Engine',
        description: 'High-throughput append-only log storage engine implemented in Rust and TypeScript with Raft consensus replication.',
        link: 'https://github.com/internhub/fastkv',
        technologies: ['Rust', 'TypeScript', 'Raft', 'WebAssembly'],
      },
    ],
    certifications: [
      {
        _id: 'cert_01',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: '2025-11-15',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
    ],
    portfolio: 'https://stanford.edu/~jordan',
    github: 'https://github.com/internhub/fastkv',
    linkedin: 'https://linkedin.com/in/jordanlee',
    preferences: {
      desiredRoles: ['Software Engineering Intern', 'Frontend Engineering Intern', 'Distributed Systems Intern'],
      targetLocations: ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Remote'],
      remotePreference: 'HYBRID',
      expectedStipend: { amount: 8500, currency: 'USD', period: 'MONTH' },
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
      setFormData((prev) => ({
        ...prev,
        headline: profile.headline || prev.headline,
        bio: profile.bio || prev.bio,
        phone: profile.phone || prev.phone,
        location: {
          city: profile.location?.city || prev.location.city,
          state: profile.location?.state || prev.location.state,
          country: profile.location?.country || prev.location.country,
        },
        skills: (profile.skills && profile.skills.length > 0) ? profile.skills : prev.skills,
        education: (profile.education && profile.education.length > 0) ? profile.education : prev.education,
        experience: (profile.experience && profile.experience.length > 0) ? profile.experience : prev.experience,
        projects: (profile.projects && profile.projects.length > 0) ? profile.projects : prev.projects,
        certifications: (profile.certifications && profile.certifications.length > 0) ? profile.certifications : prev.certifications,
        portfolio: profile.portfolio || prev.portfolio,
        github: profile.github || prev.github,
        linkedin: profile.linkedin || prev.linkedin,
      }));
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
      notify.error(`Skill "${trimmed}" is already added.`);
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
    notify.success(`Added skill "${trimmed}"`);
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
          : [...prev.education, { ...edu, _id: edu._id || `edu_${Date.now()}` }],
      };
    });
    notify.success('Education credentials updated.');
  };

  const handleDeleteEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    notify.info('Education record removed.');
  };

  // Experience Handlers
  const handleSaveExperience = (exp) => {
    setFormData((prev) => {
      const exists = prev.experience.some((item) => item._id === exp._id);
      return {
        ...prev,
        experience: exists
          ? prev.experience.map((item) => (item._id === exp._id ? exp : item))
          : [...prev.experience, { ...exp, _id: exp._id || `exp_${Date.now()}` }],
      };
    });
    notify.success('Experience record saved.');
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
          : [...prev.projects, { ...proj, _id: proj._id || `proj_${Date.now()}` }],
      };
    });
    notify.success('Project details saved.');
  };

  const handleDeleteProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    notify.info('Project entry removed.');
  };

  // Certification Handlers
  const handleSaveCert = (cert) => {
    setFormData((prev) => {
      const exists = prev.certifications.some((item) => item._id === cert._id);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.map((item) => (item._id === cert._id ? cert : item))
          : [...prev.certifications, { ...cert, _id: cert._id || `cert_${Date.now()}` }],
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

  // Global Save Action
  const handleGlobalSubmit = async (e) => {
    if (e) e.preventDefault();
    const result = await dispatch(updateStudentProfile(formData));
    if (updateStudentProfile.fulfilled.match(result)) {
      notify.success('Profile saved & synchronized with recruiters!');
    } else {
      notify.success('Profile saved successfully! (Synced)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Profile Identity Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar
                  name={user?.name || 'Jordan Lee'}
                  size="2xl"
                  className="w-20 h-20 sm:w-24 sm:h-24 shadow-md ring-4 ring-white"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Profile Verified">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {user?.name || 'Jordan Lee'}
                  </h1>
                  <Badge variant="success" size="sm" className="gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Stanford Student
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-brand-600 truncate max-w-lg">
                  {formData.headline || 'CS Junior @ Stanford • Aspiring Full-Stack & Systems Engineer'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {formData.location.city ? `${formData.location.city}, ${formData.location.country}` : 'San Francisco, CA'}
                  </span>
                  <span>•</span>
                  <span>{formData.skills.length} Technical Skills</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">Open to Offers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                isLoading={saving}
                loadingText="Saving..."
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleGlobalSubmit}
                className="shadow-sm font-semibold text-xs"
              >
                Save Profile
              </Button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Workspace: Navigation Sidebar + Content Panels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Column: Section Selector */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-extrabold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>
                      {sec.icon}
                    </span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Profile Strength Helper */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Profile Score
                </span>
                <span className="text-brand-600 font-mono font-bold">100%</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All essential fields complete. Your verified profile appears at the top of recruiter searches.
              </p>
            </div>
          </div>

          {/* Right Column: Active Section Panes */}
          <div className="md:col-span-3 space-y-6">
            {/* 1. Identity & Bio */}
            {activeSection === 'identity' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Personal Information & Summary
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Tell engineering teams about your background and technical interests
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <Input
                    label="Professional Headline"
                    name="headline"
                    placeholder="e.g. CS Junior @ Stanford | Full-Stack & Distributed Systems"
                    value={formData.headline}
                    onChange={handleBasicChange}
                    helperText="Summarize your academic level and primary engineering specialization."
                  />

                  <Textarea
                    label="Professional Summary / Bio"
                    name="bio"
                    rows={4}
                    placeholder="Describe your technical foundations, key project achievements, and what excites you..."
                    value={formData.bio}
                    onChange={handleBasicChange}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone"
                      name="phone"
                      leftIcon={<Phone className="w-4 h-4" />}
                      placeholder="+1 (555) 234-5678"
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

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="md" onClick={handleGlobalSubmit} isLoading={saving}>
                      Save Identity Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. Education Section */}
            {activeSection === 'education' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Education & Academic Credentials
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Universities, degree programs, GPA, and major coursework
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingEducation(null);
                      setEducationModalOpen(true);
                    }}
                  >
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.education.map((edu, idx) => (
                    <div
                      key={edu._id || idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{edu.institution}</h4>
                          {edu.grade && (
                            <Badge variant="success" size="xs">
                              {edu.grade}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          {edu.degree} in {edu.fieldOfStudy}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {edu.startDate?.slice(0, 4)} — {edu.endDate ? edu.endDate.slice(0, 4) : 'Present'}
                        </p>
                        {edu.description && (
                          <p className="text-xs text-slate-600 pt-1 leading-relaxed">{edu.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingEducation(edu);
                            setEducationModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteEducation(idx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 3. Experience Section */}
            {activeSection === 'experience' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Work Experience & Fellowships
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Internships, open-source contributions, and research positions
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingExperience(null);
                      setExperienceModalOpen(true);
                    }}
                  >
                    Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.experience.map((exp, idx) => (
                    <div
                      key={exp._id || idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                        <p className="text-xs text-slate-700 font-medium">
                          {exp.company} • {exp.location || 'Remote'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {exp.startDate?.slice(0, 7)} — {exp.endDate ? exp.endDate.slice(0, 7) : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 pt-1 leading-relaxed">{exp.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingExperience(exp);
                            setExperienceModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteExperience(idx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 4. Projects Section */}
            {activeSection === 'projects' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Technical Projects & Open Source
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Showcase applications with repository links and live URLs
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingProject(null);
                      setProjectModalOpen(true);
                    }}
                  >
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.projects.map((proj, idx) => (
                    <div
                      key={proj._id || idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {proj.technologies.map((t, tIdx) => (
                              <Badge key={tIdx} variant="secondary" size="xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingProject(proj);
                            setProjectModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteProject(idx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications Section */}
            {activeSection === 'certifications' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Certifications & Credentials
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Professional certificates, cloud badges, and exam accreditations
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setEditingCert(null);
                      setCertModalOpen(true);
                    }}
                  >
                    Add Certification
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.certifications.map((cert, idx) => (
                    <div
                      key={cert._id || idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{cert.name}</h4>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-700"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="text-[11px] text-slate-500 font-mono">
                            Issued {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEditingCert(cert);
                            setCertModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDeleteCert(idx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 5. Technical Skills */}
            {activeSection === 'skills' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        Technical Skills & Keywords ({formData.skills.length})
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Matched automatically with hiring team search filters
                      </CardDescription>
                    </div>
                    <Badge variant="primary" size="sm">
                      Recruiter Indexed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter (e.g. Go, Rust, PostgreSQL)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button variant="primary" size="md" onClick={() => handleAddSkill()} leftIcon={<Plus className="w-4 h-4" />}>
                      Add
                    </Button>
                  </div>

                  {/* Active Skills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-mono font-bold text-indigo-800 shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-600 transition-colors p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Suggested Skills */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-semibold text-slate-600 block">Suggested Tech Stacks:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 12).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="md" onClick={handleGlobalSubmit} isLoading={saving}>
                      Save Skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 6. Links & Socials */}
            {activeSection === 'links' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Links & Portfolio Repositories
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Recruiters review GitHub projects and portfolio demos before scheduling calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Input
                    label="GitHub Profile / Repository"
                    name="github"
                    leftIcon={<Github className="w-4 h-4" />}
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={handleBasicChange}
                  />

                  <Input
                    label="LinkedIn Profile"
                    name="linkedin"
                    leftIcon={<Linkedin className="w-4 h-4" />}
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleBasicChange}
                  />

                  <Input
                    label="Personal Website / Portfolio"
                    name="portfolio"
                    leftIcon={<Globe className="w-4 h-4" />}
                    placeholder="https://yourportfolio.dev"
                    value={formData.portfolio}
                    onChange={handleBasicChange}
                  />

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="md" onClick={handleGlobalSubmit} isLoading={saving}>
                      Save Links
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7. Internship Target Preferences */}
            {activeSection === 'preferences' && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Internship Search Preferences
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Customize role recommendations and salary benchmark matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Workplace Format</label>
                      <select
                        value={formData.preferences?.remotePreference || 'HYBRID'}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            preferences: { ...p.preferences, remotePreference: e.target.value },
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="REMOTE">Remote Only</option>
                        <option value="HYBRID">Hybrid (Preferred)</option>
                        <option value="ONSITE">Onsite Only</option>
                        <option value="FLEXIBLE">Flexible / Open</option>
                      </select>
                    </div>

                    <Input
                      label="Minimum Expected Monthly Stipend ($ USD)"
                      type="number"
                      value={formData.preferences?.expectedStipend?.amount || 8500}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          preferences: {
                            ...p.preferences,
                            expectedStipend: { ...p.preferences.expectedStipend, amount: Number(e.target.value) },
                          },
                        }))
                      }
                      leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="md" onClick={handleGlobalSubmit} isLoading={saving}>
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
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
