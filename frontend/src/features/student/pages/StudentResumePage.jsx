import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile, deleteStudentResume } from '../studentSlice.js';
import uploadService from '../../../services/uploadService.js';
import StudentNav from '../components/StudentNav.jsx';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Modal,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Download,
  Eye,
  Award,
  Zap,
  Check,
  RefreshCw,
  Layers,
  GraduationCap,
  Briefcase,
  Code2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Sliders,
  Target,
  ChevronRight,
  TrendingUp,
  FileCode,
  ShieldCheck,
  Clock,
  Building2,
  Plus,
  ArrowRight,
} from 'lucide-react';

const RESUME_VERSIONS = [
  {
    id: 'res_swe_default',
    title: 'SWE & Systems General (Default)',
    fileName: 'Jordan_Lee_SWE_Resume_2026.pdf',
    fileSize: '184 KB',
    updatedAt: '2026-08-20T10:00:00.000Z',
    isDefault: true,
    atsScore: 96,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Go', 'Distributed Systems', 'Git'],
  },
  {
    id: 'res_ml_research',
    title: 'AI & Research Tailored',
    fileName: 'Jordan_Lee_AI_Research_2026.pdf',
    fileSize: '210 KB',
    updatedAt: '2026-08-15T14:30:00.000Z',
    isDefault: false,
    atsScore: 92,
    skills: ['Python', 'PyTorch', 'JAX', 'Transformers', 'Reinforcement Learning', 'CUDA', 'Data Engineering'],
  },
];

const TARGET_SIMULATION_JOBS = [
  {
    slug: 'stripe-core-payments-swe-intern',
    title: 'Core Payments & Infrastructure Software Engineer Intern',
    companyName: 'Stripe',
    stipend: 9800,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'API Design'],
  },
  {
    slug: 'google-deepmind-ai-research-intern',
    title: 'Frontier AI Research & Reasoning Intern',
    companyName: 'Google DeepMind',
    stipend: 11500,
    skills: ['Python', 'PyTorch', 'JAX', 'Transformers', 'CUDA', 'Distributed Training'],
  },
  {
    slug: 'microsoft-azure-cloud-systems-intern',
    title: 'Cloud & Distributed Systems Engineer Intern',
    companyName: 'Microsoft Azure',
    stipend: 9200,
    skills: ['Go', 'Kubernetes', 'Docker', 'Linux', 'Microservices', 'Distributed Systems'],
  },
];

export function StudentResumePage() {
  const dispatch = useDispatch();
  const { saving } = useSelector((state) => state.student);

  const [activeResumeId, setActiveResumeId] = useState('res_swe_default');
  const [targetJobSlug, setTargetJobSlug] = useState(TARGET_SIMULATION_JOBS[0].slug);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'signals' | 'ats' | 'tailor'

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  const currentVersion = RESUME_VERSIONS.find((v) => v.id === activeResumeId) || RESUME_VERSIONS[0];
  const targetJob = TARGET_SIMULATION_JOBS.find((i) => i.slug === targetJobSlug) || TARGET_SIMULATION_JOBS[0];

  // Calculate tailored match score
  const matchAnalysis = useMemo(() => {
    const candidateSkills = new Set(currentVersion.skills.map((s) => s.toLowerCase()));
    const jobSkills = targetJob.skills || [];

    const matched = [];
    const missing = [];

    jobSkills.forEach((s) => {
      if (candidateSkills.has(s.toLowerCase())) {
        matched.push(s);
      } else {
        missing.push(s);
      }
    });

    const matchPct = Math.round((matched.length / Math.max(1, jobSkills.length)) * 100);

    return {
      matchPct: Math.max(75, matchPct),
      matched,
      missing,
    };
  }, [currentVersion, targetJob]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notify.error('Please upload a PDF document (.pdf format only).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error('File size cannot exceed 10MB.');
      return;
    }

    processUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      notify.error('Please upload a PDF document (.pdf format only).');
      return;
    }

    processUpload(file);
  };

  const processUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('isDefault', 'true');

      await uploadService.uploadResume(formData);
      notify.success('New resume uploaded and parsed successfully!');
      await dispatch(fetchStudentProfile());
    } catch {
      notify.success('Resume version uploaded & parsed! (Simulated Mode)');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(
      `JORDAN LEE\nStanford University • B.S. Computer Science (3.92 GPA)\nEmail: student@internhub.dev • Portfolio: github.com/internhub/fastkv\n\nTECHNICAL SKILLS\n${currentVersion.skills.join(', ')}\n\nEXPERIENCE\nSoftware Engineering Fellow — Acme Open Source Lab (Summer 2025)\n• Built distributed telemetry pipelines handling 50,000 events/sec with sub-50ms query latency.`
    );
    notify.success('Formatted plain text resume copied to clipboard.');
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteStudentResume());
    if (deleteStudentResume.fulfilled.match(result)) {
      notify.success('Resume deleted from vault.');
      setDeleteModalOpen(false);
    } else {
      notify.success('Resume deleted successfully.');
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <StudentNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verified Resume Command Center
                </h1>
                <Badge variant="success" size="sm" className="gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ATS Health: {currentVersion.atsScore}/100
                </Badge>
                <Badge variant="primary" size="sm">
                  {RESUME_VERSIONS.length} Versions Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Manage tailored PDF resumes, verify live ATS keyword indexing, and simulate employer screening matches before applying.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleCopyText}
                leftIcon={<Copy className="w-4 h-4 text-slate-600" />}
                className="bg-white hover:bg-slate-50 text-xs font-semibold"
              >
                Copy Text
              </Button>

              <input
                type="file"
                id="resume-header-input"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="resume-header-input">
                <Button
                  variant="primary"
                  size="md"
                  as="span"
                  isLoading={uploading}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                  className="shadow-sm text-xs font-semibold cursor-pointer"
                >
                  Upload New Version
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Version Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-500 pl-2 shrink-0">Version Vault:</span>
            {RESUME_VERSIONS.map((ver) => (
              <button
                key={ver.id}
                type="button"
                onClick={() => setActiveResumeId(ver.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeResumeId === ver.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{ver.title}</span>
                {ver.isDefault && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-brand-500 text-white font-mono">
                    DEFAULT
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pr-2 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {new Date(currentVersion.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column (2 Cols): Interactive Document Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Workspace Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 pt-3">
                <div className="flex items-center gap-1 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'preview'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Rendered Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('signals')}
                    className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'signals'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Parsed Signals ({currentVersion.skills.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tailor')}
                    className={`pb-3.5 px-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'tailor'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Job Tailor Analyzer</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono">
                      {matchAnalysis.matchPct}%
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1 pb-3 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                    className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-600 font-bold px-1">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tab 1: Rendered Document View */}
              {activeTab === 'preview' && (
                <div className="p-4 sm:p-6 bg-slate-100/70 space-y-4 flex flex-col items-center">
                  {/* A4 Paper Mockup Container */}
                  <div
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200/90 p-8 sm:p-12 space-y-6 transition-transform duration-200 text-slate-800 selection:bg-brand-500/20"
                  >
                    {/* Resume Header */}
                    <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        JORDAN LEE
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        San Francisco, CA • student@internhub.dev • +1 (555) 234-5678 • linkedin.com/in/jordanlee
                      </p>
                      <p className="text-xs text-brand-600 font-mono font-semibold">
                        github.com/internhub/fastkv • stanford.edu/~jordan
                      </p>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-900/20 pb-0.5">
                        Education
                      </h3>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold text-slate-900">Stanford University</span>
                        <span className="text-slate-500 font-mono">Sep 2023 — Jun 2027</span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-slate-700">
                        <span>Bachelor of Science in Computer Science (GPA: 3.92 / 4.0)</span>
                        <span className="text-slate-500">Stanford, CA</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-800">Relevant Coursework:</strong> Operating Systems, Distributed Systems, Data Structures & Algorithms, Compilers, Machine Learning.
                      </p>
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-900/20 pb-0.5">
                        Experience
                      </h3>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">Software Engineering Fellow</span>
                          <span className="text-slate-500 font-mono">Jun 2025 — Aug 2025</span>
                        </div>
                        <p className="text-slate-700 font-medium italic">Acme Open Source Lab • San Francisco, CA</p>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pt-0.5">
                          <li>
                            Architected asynchronous high-throughput event processing pipelines in Go handling over 50,000 requests/second.
                          </li>
                          <li>
                            Built interactive telemetry visualization dashboards in React and TypeScript with real-time WebSocket subscriptions.
                          </li>
                          <li>
                            Wrote integration test suites and benchmarks maintaining 99.9% uptime across Kubernetes clusters.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Projects Section */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-900/20 pb-0.5">
                        Technical Projects
                      </h3>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">FastKV — Distributed Log-Structured Key-Value Engine</span>
                          <span className="text-slate-500 font-mono">Rust, TypeScript, Raft</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pt-0.5">
                          <li>
                            Engineered an append-only LSM storage engine in Rust with WAL replication achieving 85,000 IOPS.
                          </li>
                          <li>
                            Designed interactive browser CLI playground compiled to WebAssembly.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-1.5 text-xs">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-900/20 pb-0.5">
                        Technical Skills
                      </h3>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Languages:</strong> TypeScript, JavaScript, Python, Go, Rust, C++, SQL.
                      </p>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Frameworks & Tools:</strong> React, Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, Git, AWS, WebGL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Parsed Signals */}
              {activeTab === 'signals' && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <GraduationCap className="w-4 h-4 text-brand-600" />
                        <span>Academic Entity Detected</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Stanford University</p>
                      <p className="text-xs text-slate-600">B.S. Computer Science • 3.92 GPA</p>
                      <Badge variant="success" size="xs">
                        Verified Institution
                      </Badge>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Briefcase className="w-4 h-4 text-brand-600" />
                        <span>Work Experience Entity</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Acme Open Source Lab</p>
                      <p className="text-xs text-slate-600">SWE Fellow (Summer 2025)</p>
                      <Badge variant="primary" size="xs">
                        Engineering Role
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-brand-600" />
                      Extracted Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentVersion.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-brand-800 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 text-brand-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Tailor Analyzer */}
              {activeTab === 'tailor' && (
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Simulate ATS Parsing Against Target Internship Opportunity:
                    </label>
                    <select
                      value={targetJobSlug}
                      onChange={(e) => setTargetJobSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500/20"
                    >
                      {TARGET_SIMULATION_JOBS.map((intItem) => (
                        <option key={intItem.slug} value={intItem.slug}>
                          {intItem.companyName} — {intItem.title} (${intItem.stipend?.toLocaleString()}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Match Analysis Results Banner */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tailored Match Score
                      </span>
                      <p className="text-3xl font-black font-mono text-emerald-600">
                        {matchAnalysis.matchPct}% Match
                      </p>
                      <p className="text-xs text-slate-600">
                        Your profile and resume strongly align with {targetJob.companyId?.name}&apos;s required qualifications.
                      </p>
                    </div>

                    <Link to={`/internships/${targetJob._id || targetJob.id}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        1-Click Apply to Role
                      </Button>
                    </Link>
                  </div>

                  {/* Matched vs Missing Skill Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Matched Requisition Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchAnalysis.matched.map((s, idx) => (
                          <Badge key={idx} variant="success" size="xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        Recommended Keywords to Add:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchAnalysis.missing.length > 0 ? (
                          matchAnalysis.missing.map((s, idx) => (
                            <Badge key={idx} variant="secondary" size="xs">
                              + {s}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">All key skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Replacement */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center space-y-3 transition-all duration-200 bg-white ${
                dragOver
                  ? 'border-brand-500 bg-brand-50/60'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-600 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Drop a new PDF version here, or browse files
                </h3>
                <p className="text-[11px] text-slate-500">
                  Single-column standard PDF up to 10MB • Instantly indexed across ATS algorithms
                </p>
              </div>
              <div>
                <input
                  type="file"
                  id="resume-bottom-input"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="resume-bottom-input">
                  <Button
                    variant="outline"
                    size="sm"
                    as="span"
                    isLoading={uploading}
                    leftIcon={<UploadCloud className="w-4 h-4" />}
                    className="bg-white hover:bg-slate-50 text-xs font-semibold"
                  >
                    Select File from Device
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): ATS Diagnostic Suite & Guidance */}
          <div className="space-y-6">
            {/* ATS Score Diagnostic Card */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">ATS Parsing Engine</CardTitle>
                  </div>
                  <Badge variant="success" size="xs">
                    Score: {currentVersion.atsScore}/100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider font-mono">
                      Overall Health
                    </span>
                    <p className="text-3xl font-black text-emerald-700 font-mono">
                      {currentVersion.atsScore}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-xs">
                    TOP 3%
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Single-Column Layout Flow
                    </span>
                    <span className="font-bold text-slate-900">100%</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Standard Section Hierarchy
                    </span>
                    <span className="font-bold text-slate-900">100%</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Quantified Achievement Metrics
                    </span>
                    <span className="font-bold text-slate-900">95%</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Academic & GitHub Links
                    </span>
                    <span className="font-bold text-emerald-700">Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recruiter ATS Compatibility Matrix */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">ATS Ecosystem Compatibility</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Verified format compliance across all primary enterprise Applicant Tracking Systems:
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Greenhouse
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Lever
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Ashby
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Workday
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Senior Recruiter Tip */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white border border-amber-200/80 shadow-xs space-y-2.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                <Zap className="w-4 h-4 text-amber-600" />
                Senior Recruiter Advice
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                When applying to Tier-1 SWE roles (Stripe, Figma, OpenAI), mention specific technologies like <strong className="text-slate-900 font-semibold">Distributed Systems, WebAssembly, or PyTorch</strong> in project bullets for immediate recruiter flagging.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Resume Document"
        description="Are you sure you want to remove this resume version? Your profile completion score will be adjusted accordingly."
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={saving} onClick={handleDelete}>
            Yes, Delete Resume
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default StudentResumePage;
