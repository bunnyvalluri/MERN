import React, { useState, useMemo } from 'react';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import InternshipCard from '../features/internships/components/InternshipCard.jsx';
import TestimonialCard from '../components/common/TestimonialCard.jsx';
import {
  Button,
  Badge,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  EmptyState,
} from '../components/ui/index.js';
import { notify } from '../utils/toast.js';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  FileText,
  Bell,
  Calendar,
  Layers,
  Terminal,
  Cpu,
  Palette,
  Database,
  Cloud,
  Clock,
  ExternalLink,
} from 'lucide-react';

// Static Curated Internship Opportunities Data
const ALL_INTERNSHIPS = [
  {
    id: 'int-1',
    title: 'Software Engineer Intern (Frontend / UI)',
    company: 'Vercel',
    companyLogo: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    location: 'San Francisco, CA',
    locationType: 'Remote',
    stipend: '$55 - $65 / hr',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    postedDate: 'Just posted',
    category: 'Software Engineering',
    featured: true,
    description:
      'Join the frontend engineering team building developer tools, design systems, and edge infrastructure used by millions of developers worldwide.',
    responsibilities: [
      'Build accessible, performant UI components for the core Vercel platform',
      'Collaborate with design and product teams on design system tokens',
      'Optimize edge rendering and frontend load times',
    ],
    requirements: [
      'Proficiency in modern JavaScript/TypeScript and React',
      'Strong understanding of web accessibility (WCAG 2.1) and responsive CSS',
      'Enrolled in a Computer Science or related degree program',
    ],
  },
  {
    id: 'int-2',
    title: 'Distributed Systems & Backend Intern',
    company: 'Datadog',
    companyLogo: 'https://img.logo.dev/datadoghq.com?token=pk_anonymous',
    location: 'New York, NY',
    locationType: 'Hybrid',
    stipend: '$50 - $60 / hr',
    skills: ['Node.js', 'Go', 'Kubernetes', 'MongoDB'],
    postedDate: '1 day ago',
    category: 'Software Engineering',
    featured: true,
    description:
      'Work with petabyte-scale telemetry pipelines processing millions of metric events per second for cloud-native infrastructure.',
    responsibilities: [
      'Design microservices handling high-throughput telemetry ingestion',
      'Write robust unit and integration test suites',
      'Participate in architecture reviews and database optimization',
    ],
    requirements: [
      'Solid foundation in algorithms, data structures, and concurrency',
      'Experience building RESTful or gRPC backend APIs',
      'Graduation date between Dec 2026 and June 2028',
    ],
  },
  {
    id: 'int-3',
    title: 'AI / Machine Learning Engineer Intern',
    company: 'Anthropic',
    companyLogo: 'https://img.logo.dev/anthropic.com?token=pk_anonymous',
    location: 'San Francisco, CA',
    locationType: 'On-site',
    stipend: '$65 - $75 / hr',
    skills: ['Python', 'PyTorch', 'Transformers', 'CUDA'],
    postedDate: '2 days ago',
    category: 'AI / ML',
    featured: true,
    description:
      'Conduct research and build evaluation pipelines for next-generation generative AI models and alignment benchmarks.',
    responsibilities: [
      'Implement scalable evaluation benchmarks for reasoning models',
      'Optimize model fine-tuning pipelines on GPU clusters',
      'Collaborate directly with senior research scientists',
    ],
    requirements: [
      'Strong programming skills in Python and PyTorch',
      'Familiarity with transformer architectures and attention mechanisms',
      'Strong mathematical foundation in linear algebra and probability',
    ],
  },
  {
    id: 'int-4',
    title: 'Product Design & UI/UX Intern',
    company: 'Figma',
    companyLogo: 'https://img.logo.dev/figma.com?token=pk_anonymous',
    location: 'San Francisco, CA',
    locationType: 'Remote',
    stipend: '$48 - $58 / hr',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    postedDate: '3 days ago',
    category: 'Product & Design',
    featured: false,
    description:
      'Help craft intuitive product workflows, design systems, and collaborative canvas interactions for creative teams.',
    responsibilities: [
      'Design end-to-end user flows, wireframes, and high-fidelity prototypes',
      'Conduct user interviews with software engineers and designers',
      'Contribute to internal component libraries and design tokens',
    ],
    requirements: [
      'A portfolio showcasing interaction design and design system thinking',
      'Strong visual hierarchy, typography, and layout skills',
      'Empathy for user needs and curiosity for collaborative software',
    ],
  },
  {
    id: 'int-5',
    title: 'Data Science & Analytics Intern',
    company: 'Stripe',
    companyLogo: 'https://img.logo.dev/stripe.com?token=pk_anonymous',
    location: 'Seattle, WA',
    locationType: 'Remote',
    stipend: '$55 - $65 / hr',
    skills: ['SQL', 'Python', 'Pandas', 'Tableau'],
    postedDate: '4 days ago',
    category: 'Data Science',
    featured: false,
    description:
      'Analyze global payment velocity, user conversion funnels, and fraud detection algorithms for millions of online businesses.',
    responsibilities: [
      'Build statistical models to forecast payment volume trends',
      'Design and analyze A/B tests for merchant onboarding funnels',
      'Create executive dashboards and data pipelines',
    ],
    requirements: [
      'Advanced proficiency in SQL and data manipulation libraries (Pandas/Polars)',
      'Understanding of experimental design and hypothesis testing',
      'Strong communication skills to explain technical insights',
    ],
  },
  {
    id: 'int-6',
    title: 'Cloud Infrastructure & DevOps Intern',
    company: 'Cloudflare',
    companyLogo: 'https://img.logo.dev/cloudflare.com?token=pk_anonymous',
    location: 'Austin, TX',
    locationType: 'Hybrid',
    stipend: '$50 - $60 / hr',
    skills: ['Docker', 'Terraform', 'Linux', 'Rust'],
    postedDate: '5 days ago',
    category: 'Cloud & DevOps',
    featured: false,
    description:
      'Automate edge deployment pipelines, monitor global DNS networks, and ensure 99.999% uptime across 300+ edge data centers.',
    responsibilities: [
      'Automate multi-region infrastructure provisioning using Terraform',
      'Build CI/CD pipelines with automated vulnerability scans',
      'Monitor edge node latency and telemetry metrics',
    ],
    requirements: [
      'Comfortable with Linux shell scripting and container fundamentals (Docker)',
      'Understanding of networking fundamentals (TCP/IP, DNS, TLS)',
      'Curiosity about systems programming and cloud reliability',
    ],
  },
];

// Category Filter Pills
const CATEGORIES = [
  { id: 'all', label: 'All Fields', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'Software Engineering', label: 'Software Engineering', icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: 'AI / ML', label: 'AI & Machine Learning', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'Product & Design', label: 'Product & Design', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'Data Science', label: 'Data Science', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: <Cloud className="w-3.5 h-3.5" /> },
];

// Testimonials Data
const TESTIMONIALS = [
  {
    quote:
      'InternHub completely transformed my internship search. I applied directly to Vercel through the platform and was interviewing within 4 days. The real-time status tracker eliminated all the ghosting anxiety.',
    author: 'Marcus Vance',
    role: 'Software Engineer Intern at Vercel',
    affiliation: 'UC Berkeley, Class of 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    type: 'student',
    rating: 5,
  },
  {
    quote:
      'As an engineering recruiter, finding candidates with verified technical skills and genuine project portfolios used to take weeks. InternHub allowed us to fill our entire summer cohort in under 18 days.',
    author: 'Elena Rostova',
    role: 'Head of University Talent',
    affiliation: 'Datadog Engineering',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    type: 'recruiter',
    rating: 5,
  },
  {
    quote:
      'The ability to filter by verified stipend, remote flexibility, and precise tech stack saved me hundreds of hours. I landed my dream AI research internship at Anthropic directly through InternHub.',
    author: 'Devon Takahashi',
    role: 'Machine Learning Intern at Anthropic',
    affiliation: 'MIT, Class of 2027',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    type: 'student',
    rating: 5,
  },
];

export function LandingPage() {
  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  // Saved Internships State (Set of IDs)
  const [savedInternships, setSavedInternships] = useState(new Set(['int-1', 'int-3']));

  // Modal States
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'register' });

  // Filtered Internships Computation
  const filteredInternships = useMemo(() => {
    return ALL_INTERNSHIPS.filter((item) => {
      // Category match
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Keyword match
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCompany = item.company.toLowerCase().includes(query);
        const matchesSkills = item.skills.some((s) => s.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCompany && !matchesSkills) return false;
      }
      // Location type match
      if (searchLocation !== 'all') {
        if (item.locationType !== searchLocation) return false;
      }
      return true;
    });
  }, [activeCategory, searchKeyword, searchLocation]);

  // Handle Save / Bookmark
  const handleToggleSave = (id) => {
    setSavedInternships((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        notify.info('Internship removed from saved list.');
      } else {
        next.add(id);
        notify.success('Opportunity saved! Access it in your saved tracker.');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      {/* Global Navigation */}
      <Navbar
        onAuthModalOpen={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs sm:text-sm font-medium shadow-sm hover:bg-brand-500/15 transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Summer 2027 Cohort Applications Are Now Live</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </div>

            {/* Main Headline */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Find the right internship.{' '}
                <span className="text-gradient block sm:inline">Build your future.</span>
              </h1>
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Discover curated opportunities at top tech companies, apply directly with a verified
                academic profile, and track your career journey in one unified platform.
              </p>
            </div>

            {/* Interactive Search Bar */}
            <div className="max-w-3xl mx-auto pt-2">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-modal backdrop-blur-md flex flex-col sm:flex-row items-center gap-2">
                <div className="w-full sm:flex-1">
                  <Input
                    placeholder="Role, skill, or company (e.g. React, Python, Stripe)..."
                    leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="border-transparent bg-transparent focus:ring-0 focus:border-transparent"
                    wrapperClassName="w-full"
                  />
                </div>

                <div className="w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-2">
                  <Select
                    options={[
                      { value: 'all', label: 'All Workplaces' },
                      { value: 'Remote', label: 'Remote Only' },
                      { value: 'Hybrid', label: 'Hybrid' },
                      { value: 'On-site', label: 'On-site' },
                    ]}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="border-transparent bg-transparent text-xs sm:text-sm py-2"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<Search className="w-4 h-4" />}
                  onClick={() => {
                    const el = document.getElementById('featured');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto shrink-0 px-6 font-semibold"
                >
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* CTAs & Trust Indicators */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-8 shadow-lg shadow-brand-600/20"
              >
                Create Free Student Profile
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6"
              >
                How It Works
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Employers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Zero Placement Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Real-Time Status Tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TRUST METRICS COUNTERS                                                   */}
        {/* ========================================================================= */}
        <section className="border-y border-slate-800/80 bg-slate-900/40 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  10,000+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  Active Students
                </div>
                <p className="text-[11px] text-slate-500">From 150+ accredited universities</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-brand-400 font-mono tracking-tight">
                  500+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  Verified Companies
                </div>
                <p className="text-[11px] text-slate-500">Startups to Fortune 500 tech teams</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  2,000+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  Opportunities
                </div>
                <p className="text-[11px] text-slate-500">Updated hourly with verified stipends</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  100%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300">
                  Application Tracking
                </div>
                <p className="text-[11px] text-slate-500">Zero ghosting with timeline updates</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURED INTERNSHIPS & DISCOVERY                                         */}
        {/* ========================================================================= */}
        <section id="featured" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">
                Featured Opportunities
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Explore Curated Tech Internships
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                High-growth engineering and product internships offering competitive compensation and
                direct mentorship.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredInternships.length} of {ALL_INTERNSHIPS.length} roles
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Internships Grid */}
          {filteredInternships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  isSaved={savedInternships.has(internship.id)}
                  onToggleSave={handleToggleSave}
                  onViewDetails={(item) => setSelectedInternship(item)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching internships found"
              description="Try adjusting your keyword search, workplace filter, or selecting another category."
              primaryAction={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearchKeyword('');
                    setSearchLocation('all');
                    setActiveCategory('all');
                  }}
                >
                  Clear All Filters
                </Button>
              }
            />
          )}
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS (4-STEP PROCESS)                                            */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 sm:py-28 border-t border-slate-800 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="primary" size="sm">
                Transparent Workflow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                How InternHub Works
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                From discovery to your first offer letter — streamlined in four simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 01 */}
              <Card className="border-slate-800/80 bg-slate-900/80 relative">
                <CardHeader>
                  <span className="text-4xl font-extrabold text-brand-500/30 font-mono block">
                    01
                  </span>
                  <CardTitle className="mt-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-400" />
                    Create Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Set up your verified profile with university details, GitHub, projects, and target
                    engineering domains.
                  </p>
                </CardContent>
              </Card>

              {/* Step 02 */}
              <Card className="border-slate-800/80 bg-slate-900/80 relative">
                <CardHeader>
                  <span className="text-4xl font-extrabold text-brand-500/30 font-mono block">
                    02
                  </span>
                  <CardTitle className="mt-2 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-400" />
                    Discover Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Filter opportunities by transparent stipend rates, remote flexibility, tech stacks,
                    and verified hiring timelines.
                  </p>
                </CardContent>
              </Card>

              {/* Step 03 */}
              <Card className="border-slate-800/80 bg-slate-900/80 relative">
                <CardHeader>
                  <span className="text-4xl font-extrabold text-brand-500/30 font-mono block">
                    03
                  </span>
                  <CardTitle className="mt-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-400" />
                    Apply Directly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Submit customized applications with your Cloudinary-hosted resume in 1 click directly
                    to verified hiring managers.
                  </p>
                </CardContent>
              </Card>

              {/* Step 04 */}
              <Card className="border-slate-800/80 bg-slate-900/80 relative">
                <CardHeader>
                  <span className="text-4xl font-extrabold text-brand-500/30 font-mono block">
                    04
                  </span>
                  <CardTitle className="mt-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-400" />
                    Track Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Receive real-time notifications on shortlists, schedule technical screens, and
                    manage offers without ever being ghosted.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STUDENT BENEFITS & PLATFORM ADVANTAGES                                   */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="primary" size="sm">
              Built for Students
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Everything You Need to Land Your Dream Internship
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              InternHub replaces messy spreadsheets and ghosted job boards with a single, reliable
              career command center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Benefit 1 */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Personalized Matches</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Smart recommendations based on your graduation year, programming languages, GPA, and
                target location preferences.
              </p>
            </Card>

            {/* Benefit 2 */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Cloud Resume Management</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Securely store and update resume versions with instant Cloudinary CDN delivery to
                recruiters.
              </p>
            </Card>

            {/* Benefit 3 */}
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instant Notifications</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Real-time alerts whenever a recruiter reviews your resume, schedules an interview, or
                updates your status.
              </p>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COMPANIES & RECRUITER SECTION                                            */}
        {/* ========================================================================= */}
        <section id="companies" className="py-20 sm:py-28 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="success" size="sm">
                  For Hiring Teams & Recruiters
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Hire top engineering interns with zero friction.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Connect with verified undergraduate and graduate candidates from top engineering
                  programs. Filter by real technical skills, manage candidate pipelines, and schedule
                  interviews seamlessly.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        Verified Student Talent
                      </span>
                      <span className="text-xs text-slate-400">
                        All applicants verify university enrollment and coursework.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        Direct Pipeline Management
                      </span>
                      <span className="text-xs text-slate-400">
                        Shortlist, reject, or schedule interviews in 1 click without third-party tools.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        University Analytics
                      </span>
                      <span className="text-xs text-slate-400">
                        Analyze applicant conversion rates and top engineering campuses.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => setAuthModal({ isOpen: true, mode: 'recruiter' })}
                  >
                    Post an Internship Free
                  </Button>
                </div>
              </div>

              {/* Visual Preview Card */}
              <div className="lg:col-span-6">
                <Card className="border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Recruiter Command Center</h4>
                        <p className="text-xs text-slate-400">Summer Engineering Hiring Cohort</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" dot pulse>
                      Live Pipeline
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 block">Total Applicants</span>
                        <span className="text-base font-bold text-white font-mono">148 Candidates</span>
                      </div>
                      <Badge variant="primary" size="sm">
                        +24 Today
                      </Badge>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 block">Technical Screens Scheduled</span>
                        <span className="text-base font-bold text-white font-mono">12 Completed</span>
                      </div>
                      <Badge variant="success" size="sm">
                        85% Pass Rate
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TESTIMONIALS SECTION                                                     */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="primary" size="sm">
              Social Proof & Trust
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Loved by Students & Engineering Leaders
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Read how InternHub connects candidates to meaningful early-career tech experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <TestimonialCard key={idx} {...t} />
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CAREER RESOURCES SECTION                                                 */}
        {/* ========================================================================= */}
        <section id="resources" className="py-16 sm:py-24 border-t border-slate-800 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <Badge variant="primary" size="sm" className="mb-2">
                  Knowledge Hub
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Free Student Career Resources
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Handcrafted guides on technical interviewing, resume formatting, and internship compensation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <span className="text-xs font-mono text-brand-400 font-semibold">GUIDE • 8 MIN READ</span>
                <h3 className="text-base font-bold text-white">
                  The Complete 2026 Tech Resume Blueprint
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  How to highlight personal projects, open-source contributions, and relevant coursework
                  to pass automated ATS screenings.
                </p>
              </Card>

              <Card hoverable className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <span className="text-xs font-mono text-emerald-400 font-semibold">INTERVIEW PREP • 12 MIN READ</span>
                <h3 className="text-base font-bold text-white">
                  Cracking the Live Technical Coding Screen
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Essential algorithms, system design trade-offs, and communication strategies for 45-minute
                  live coding interviews.
                </p>
              </Card>

              <Card hoverable className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <span className="text-xs font-mono text-amber-400 font-semibold">INDEX • UPDATED WEEKLY</span>
                <h3 className="text-base font-bold text-white">
                  2026 Software Internship Stipend Index
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Transparent hourly rates, relocation benefits, and housing stipends across top tech hubs
                  including SF, NYC, and Seattle.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION                                                     */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/40 via-slate-900 to-indigo-950/40 -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to start your career?
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join over 10,000 students discovering curated opportunities and building verified career
                profiles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-8 shadow-xl shadow-brand-600/25"
              >
                Create Your Profile
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('featured');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6"
              >
                Explore 2,000+ Internships
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* ========================================================================= */}
      {/* QUICK OPPORTUNITY DETAILS MODAL                                           */}
      {/* ========================================================================= */}
      {selectedInternship && (
        <Modal
          isOpen={Boolean(selectedInternship)}
          onClose={() => setSelectedInternship(null)}
          size="lg"
        >
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 p-2 flex items-center justify-center shrink-0 border border-slate-700">
                <Building2 className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <ModalTitle>{selectedInternship.title}</ModalTitle>
                <ModalDescription>
                  {selectedInternship.company} • {selectedInternship.location} ({selectedInternship.locationType})
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-6">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs">
                <span className="text-slate-400 block">Stipend Rate</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {selectedInternship.stipend}
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4 text-xs">
                <span className="text-slate-400 block">Category</span>
                <span className="text-slate-200 font-semibold">{selectedInternship.category}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Role Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedInternship.description}
              </p>
            </div>

            {selectedInternship.responsibilities && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Key Responsibilities
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
                  {selectedInternship.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedInternship.requirements && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Requirements & Qualifications
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
                  {selectedInternship.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Required Tech Stack
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedInternship.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => {
                handleToggleSave(selectedInternship.id);
              }}
            >
              {savedInternships.has(selectedInternship.id) ? 'Saved' : 'Save for Later'}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedInternship(null);
                setAuthModal({ isOpen: true, mode: 'register' });
              }}
            >
              Apply via InternHub
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTICATION / GET STARTED MODAL DIALOG                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'register' })}
        size="md"
      >
        <ModalHeader>
          <ModalTitle>
            {authModal.mode === 'login'
              ? 'Welcome back to InternHub'
              : authModal.mode === 'recruiter'
              ? 'Create Recruiter Account'
              : 'Create Free Student Profile'}
          </ModalTitle>
          <ModalDescription>
            {authModal.mode === 'login'
              ? 'Sign in to track your applications and review interviews.'
              : 'Join top students and companies discovering talent on InternHub.'}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder={authModal.mode === 'recruiter' ? 'recruiter@company.com' : 'student@university.edu'}
            required
          />
          <Input label="Password" type="password" placeholder="••••••••••••" required />

          {authModal.mode !== 'login' && (
            <div className="text-xs text-slate-400">
              By creating an account, you agree to the InternHub{' '}
              <a href="#" className="text-brand-400 underline">Terms</a> and{' '}
              <a href="#" className="text-brand-400 underline">Privacy Policy</a>.
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setAuthModal({ isOpen: false, mode: 'register' })}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setAuthModal({ isOpen: false, mode: 'register' });
              notify.success(
                authModal.mode === 'login'
                  ? 'Authenticated successfully! Redirecting...'
                  : 'Profile registered! Welcome to InternHub.'
              );
            }}
          >
            {authModal.mode === 'login' ? 'Sign In' : 'Continue'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default LandingPage;
