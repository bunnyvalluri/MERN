import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';
import SEOHead from '../components/common/SEOHead.jsx';
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
  Zap,
  Flame,
  LayoutGrid,
  List,
  SlidersHorizontal,
  DollarSign,
  Award,
  ArrowUpRight,
  Star,
  Check,
  X,
  ChevronRight,
  BookOpen,
  Send,
  Lock,
} from 'lucide-react';

// Comprehensive verified internships dataset
const ALL_INTERNSHIPS = [
  {
    id: 'int-1',
    title: 'Software Engineer Intern (Frontend / UI)',
    company: 'Vercel',
    companyLogo: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    location: 'San Francisco, CA',
    locationType: 'Remote',
    stipend: '$55 - $65 / hr',
    stipendNum: 60,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    postedDate: 'Just posted',
    category: 'Software Engineering',
    featured: true,
    urgency: '🔥 Fast Response (24h)',
    perks: ['Remote equipment stipend', '1-on-1 Staff Eng mentorship', 'Flexible summer start'],
    description:
      'Join the frontend engineering team building developer tools, design systems, and edge infrastructure used by millions of developers worldwide.',
    responsibilities: [
      'Build accessible, performant UI components for the core Vercel dashboard and developer tools',
      'Collaborate with design and product teams on design system tokens and micro-interactions',
      'Optimize edge rendering and frontend load times across global CDNs',
    ],
    requirements: [
      'Proficiency in modern JavaScript/TypeScript and React ecosystem',
      'Strong understanding of web accessibility (WCAG 2.1) and responsive CSS',
      'Enrolled in a Computer Science or related undergraduate/graduate program',
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
    stipendNum: 55,
    skills: ['Node.js', 'Go', 'Kubernetes', 'MongoDB'],
    postedDate: '1 day ago',
    category: 'Software Engineering',
    featured: true,
    urgency: '⚡ High Demand',
    perks: ['NYC housing assistance', 'Commuter benefit', 'Executive speaker series'],
    description:
      'Work with petabyte-scale telemetry pipelines processing millions of metric events per second for cloud-native infrastructure.',
    responsibilities: [
      'Design microservices handling high-throughput telemetry ingestion and real-time alerts',
      'Write robust unit and integration test suites with zero downtime deployments',
      'Participate in architecture reviews and database performance tuning',
    ],
    requirements: [
      'Solid foundation in algorithms, data structures, and distributed concurrency',
      'Experience building RESTful or gRPC backend APIs in Go, Node.js, or Java',
      'Expected graduation date between Dec 2026 and June 2028',
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
    stipendNum: 70,
    skills: ['Python', 'PyTorch', 'Transformers', 'CUDA'],
    postedDate: '2 days ago',
    category: 'AI / ML',
    featured: true,
    urgency: '🚀 Top Compensation',
    perks: ['Full housing stipend in SF', 'Direct research publishing track', 'Catered gourmet meals'],
    description:
      'Conduct research and build evaluation pipelines for next-generation generative AI models and alignment benchmarks.',
    responsibilities: [
      'Implement scalable evaluation benchmarks for frontier reasoning and safety models',
      'Optimize model fine-tuning pipelines and distributed training runs on GPU clusters',
      'Collaborate directly with senior research scientists on peer-reviewed research papers',
    ],
    requirements: [
      'Strong programming skills in Python and PyTorch / JAX',
      'Familiarity with transformer architectures, attention mechanisms, and RLHF',
      'Strong mathematical foundation in linear algebra, multivariable calculus, and probability',
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
    stipendNum: 53,
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    postedDate: '3 days ago',
    category: 'Product & Design',
    featured: false,
    urgency: '🎨 Creative Cohort',
    perks: ['Design workshop budget', 'Hardware choice (MacBook Pro + Studio Display)', 'Remote wellness perk'],
    description:
      'Help craft intuitive product workflows, design systems, and collaborative canvas interactions for creative teams worldwide.',
    responsibilities: [
      'Design end-to-end user flows, interactive wireframes, and high-fidelity prototypes',
      'Conduct user interviews with software engineers and designers to uncover workflow friction',
      'Contribute to internal component libraries, design tokens, and accessibility guidelines',
    ],
    requirements: [
      'A portfolio showcasing interaction design, design system thinking, and user research',
      'Strong visual hierarchy, typography, layout, and micro-interaction skills',
      'Empathy for user needs and curiosity for collaborative web software',
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
    stipendNum: 60,
    skills: ['SQL', 'Python', 'Pandas', 'Tableau'],
    postedDate: '4 days ago',
    category: 'Data Science',
    featured: false,
    urgency: '📈 High Conversion',
    perks: ['Home office setup allowance', 'Annual learning stipend', 'Executive mentorship'],
    description:
      'Analyze global payment velocity, user conversion funnels, and fraud detection algorithms for millions of online businesses.',
    responsibilities: [
      'Build statistical models to forecast payment volume trends and merchant churn rates',
      'Design and analyze rigorous A/B tests for merchant onboarding funnels',
      'Create executive dashboards and automated data pipelines using dbt and Snowflake',
    ],
    requirements: [
      'Advanced proficiency in SQL and data manipulation libraries (Pandas / Polars)',
      'Understanding of experimental design, causal inference, and hypothesis testing',
      'Strong communication skills to explain technical insights to non-technical stakeholders',
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
    stipendNum: 55,
    skills: ['Docker', 'Terraform', 'Linux', 'Rust'],
    postedDate: '5 days ago',
    category: 'Cloud & DevOps',
    featured: false,
    urgency: '🌐 Global Scale',
    perks: ['Austin housing stipend', 'Cloud certification vouchers', '401k matching during internship'],
    description:
      'Automate edge deployment pipelines, monitor global DNS networks, and ensure 99.999% uptime across 300+ edge data centers.',
    responsibilities: [
      'Automate multi-region infrastructure provisioning using Terraform and Kubernetes',
      'Build CI/CD pipelines with automated vulnerability scanning and canary deployments',
      'Monitor edge node latency and telemetry metrics across hundreds of PoPs',
    ],
    requirements: [
      'Comfortable with Linux shell scripting and container fundamentals (Docker)',
      'Understanding of networking fundamentals (TCP/IP, DNS, TLS, BGP)',
      'Curiosity about systems programming, Rust/Go, and high-reliability cloud architecture',
    ],
  },
  {
    id: 'int-7',
    title: 'Full Stack Engineering Intern',
    company: 'Linear',
    companyLogo: 'https://img.logo.dev/linear.app?token=pk_anonymous',
    location: 'San Francisco, CA',
    locationType: 'Remote',
    stipend: '$60 - $70 / hr',
    stipendNum: 65,
    skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    postedDate: '3 days ago',
    category: 'Software Engineering',
    featured: true,
    urgency: '⚡ Craft Focused',
    perks: ['High keyboard/setup budget', '100% remote flexibility', 'Direct engineering leadership pairing'],
    description:
      'Help build the world-class issue tracker and project management platform beloved by modern software engineering teams.',
    responsibilities: [
      'Ship polished UI interactions, keyboard shortcuts, and optimistic state updates',
      'Write scalable GraphQL backend services and database migrations',
      'Collaborate on performance benchmarks targeting 60fps web performance',
    ],
    requirements: [
      'Obsession with UI craft, typography, responsiveness, and keyboard-first UX',
      'Strong TypeScript and React experience with full-stack capabilities',
      'Active student enrolled in a Computer Science or related degree',
    ],
  },
  {
    id: 'int-8',
    title: 'Machine Learning Research Intern (LLMs)',
    company: 'OpenAI',
    companyLogo: 'https://img.logo.dev/openai.com?token=pk_anonymous',
    location: 'San Francisco, CA',
    locationType: 'On-site',
    stipend: '$70 - $80 / hr',
    stipendNum: 75,
    skills: ['Python', 'PyTorch', 'Distributed Training', 'NLP'],
    postedDate: '1 day ago',
    category: 'AI / ML',
    featured: true,
    urgency: '🤖 High Priority',
    perks: ['Premium housing in SF', 'GPU allocation', 'Publishing and conference travel sponsorship'],
    description:
      'Collaborate with frontier research teams on foundational model alignment, synthetic data generation, and reasoning architectures.',
    responsibilities: [
      'Train and evaluate fine-tuned reasoning models across extensive mathematical and coding benchmarks',
      'Develop scalable data filtering and synthetic generation pipelines',
      'Conduct ablations and publish findings with the research community',
    ],
    requirements: [
      'Demonstrated research experience or significant open-source contributions in NLP/LLMs',
      'Proficiency with PyTorch and distributed GPU training frameworks (Megatron/DeepSpeed)',
      'Graduate or senior undergraduate in Computer Science, Math, or Physics',
    ],
  },
];

// Category Filter Pills with counts
const CATEGORIES = [
  { id: 'all', label: 'All Fields', icon: <Layers className="w-4 h-4" /> },
  { id: 'Software Engineering', label: 'Software Engineering', icon: <Terminal className="w-4 h-4" /> },
  { id: 'AI / ML', label: 'AI & Machine Learning', icon: <Cpu className="w-4 h-4" /> },
  { id: 'Product & Design', label: 'Product & Design', icon: <Palette className="w-4 h-4" /> },
  { id: 'Data Science', label: 'Data Science', icon: <Database className="w-4 h-4" /> },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: <Cloud className="w-4 h-4" /> },
];

// Trending Quick Search Tags
const TRENDING_SEARCHES = [
  { label: '🔥 React / Next.js', query: 'React' },
  { label: '🤖 AI / LLMs', query: 'AI' },
  { label: '⚡ $60+/hr Stipend', query: '60' },
  { label: '🌐 Remote Only', location: 'Remote' },
  { label: '🏢 Stripe', query: 'Stripe' },
  { label: '🦄 Figma', query: 'Figma' },
];

// Helper for crisp, reliable company brand icons
function CompanyLogoIcon({ name }) {
  switch (name) {
    case 'Stripe':
      return (
        <span className="w-full h-full bg-[#635BFF] text-white flex items-center justify-center font-extrabold text-xs rounded-lg font-serif shadow-xs">
          S
        </span>
      );
    case 'OpenAI':
      return (
        <span className="w-full h-full bg-[#10A37F] text-white flex items-center justify-center text-xs font-bold rounded-lg shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </span>
      );
    case 'Vercel':
      return (
        <span className="w-full h-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-bold rounded-lg shadow-xs">
          ▲
        </span>
      );
    case 'Datadog':
      return (
        <span className="w-full h-full bg-[#632CA6] text-white flex items-center justify-center font-black text-[10px] rounded-lg font-mono shadow-xs">
          DD
        </span>
      );
    case 'Anthropic':
      return (
        <span className="w-full h-full bg-[#CC785C] text-white flex items-center justify-center font-black text-xs rounded-lg shadow-xs">
          A
        </span>
      );
    case 'Figma':
      return (
        <span className="w-full h-full bg-gradient-to-tr from-[#F24E1E] via-[#A259FF] to-[#0ACF83] text-white flex items-center justify-center font-black text-xs rounded-lg shadow-xs">
          F
        </span>
      );
    case 'Cloudflare':
      return (
        <span className="w-full h-full bg-[#F38020] text-white flex items-center justify-center text-xs rounded-lg shadow-xs">
          <Cloud className="w-3.5 h-3.5 text-white" />
        </span>
      );
    case 'Linear':
      return (
        <span className="w-full h-full bg-[#5E6AD2] text-white flex items-center justify-center text-xs rounded-lg shadow-xs">
          <Zap className="w-3.5 h-3.5 text-white" />
        </span>
      );
    case 'Google':
      return (
        <span className="w-full h-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs rounded-lg shadow-xs">
          G
        </span>
      );
    case 'Microsoft':
      return (
        <span className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs rounded-lg shadow-xs">
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
        </span>
      );
    default:
      return (
        <span className="w-full h-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs rounded-lg shadow-xs">
          <Building2 className="w-3.5 h-3.5 text-white" />
        </span>
      );
  }
}

// Top Hiring Tech Companies Logo Marquee Data
const TOP_COMPANIES = [
  { name: 'Stripe', roles: '14 roles' },
  { name: 'OpenAI', roles: '8 roles' },
  { name: 'Vercel', roles: '11 roles' },
  { name: 'Datadog', roles: '19 roles' },
  { name: 'Anthropic', roles: '6 roles' },
  { name: 'Figma', roles: '9 roles' },
  { name: 'Cloudflare', roles: '12 roles' },
  { name: 'Linear', roles: '5 roles' },
  { name: 'Google', roles: '22 roles' },
  { name: 'Microsoft', roles: '18 roles' },
];

// Compensation Explorer Data
const COMPENSATION_DATA = {
  'Software Engineering': {
    title: 'Software Engineering & Systems',
    medianHourly: '$55.00 / hr',
    monthlyEquivalent: '$9,500 / mo',
    topPay: '$72.00 / hr',
    remotePercent: '68% of roles',
    avgRounds: '3 rounds (OA + 2 Tech Screens)',
    topHiring: ['Stripe', 'Datadog', 'Vercel', 'Linear'],
    insights: 'Demand for TypeScript, Go, and distributed backend fundamentals remains at an all-time high.',
  },
  'AI / ML': {
    title: 'AI & Machine Learning Research',
    medianHourly: '$68.00 / hr',
    monthlyEquivalent: '$11,800 / mo',
    topPay: '$80.00 / hr',
    remotePercent: '42% of roles',
    avgRounds: '4 rounds (Research presentation + 2 Coding)',
    topHiring: ['Anthropic', 'OpenAI', 'Google DeepMind', 'Meta'],
    insights: 'Frontier AI labs offer the highest undergraduate stipends plus full SF housing stipends.',
  },
  'Product & Design': {
    title: 'Product Design & Interaction (UI/UX)',
    medianHourly: '$52.00 / hr',
    monthlyEquivalent: '$9,000 / mo',
    topPay: '$62.00 / hr',
    remotePercent: '75% of roles',
    avgRounds: '3 rounds (Portfolio review + Design challenge)',
    topHiring: ['Figma', 'Linear', 'Airbnb', 'Stripe'],
    insights: 'Strong emphasis on interactive web prototypes, design systems, and user empathy.',
  },
  'Data Science': {
    title: 'Data Science & Predictive Analytics',
    medianHourly: '$54.00 / hr',
    monthlyEquivalent: '$9,300 / mo',
    topPay: '$66.00 / hr',
    remotePercent: '60% of roles',
    avgRounds: '3 rounds (SQL / Data case + ML theory)',
    topHiring: ['Stripe', 'Netflix', 'Uber', 'Datadog'],
    insights: 'Causal inference, experiment design (A/B testing), and modern SQL are essential skills.',
  },
  'Cloud & DevOps': {
    title: 'Cloud Infrastructure & SRE',
    medianHourly: '$53.00 / hr',
    monthlyEquivalent: '$9,200 / mo',
    topPay: '$65.00 / hr',
    remotePercent: '70% of roles',
    avgRounds: '3 rounds (Linux troubleshooting + System design)',
    topHiring: ['Cloudflare', 'Datadog', 'AWS', 'HashiCorp'],
    insights: 'High demand for Linux internals, Kubernetes orchestration, and Terraform automation.',
  },
};

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
  const navigate = useNavigate();

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' | 'list'

  // Compensation Explorer State
  const [activeCompCategory, setActiveCompCategory] = useState('Software Engineering');

  // How It Works Tab State
  const [workflowTab, setWorkflowTab] = useState('students'); // 'students' | 'recruiters'

  // Saved Internships State (Set of IDs)
  const [savedInternships, setSavedInternships] = useState(new Set(['int-1', 'int-3', 'int-7']));

  // Modal States
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [modalActiveTab, setModalActiveTab] = useState('overview'); // 'overview' | 'perks' | 'apply'
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'register' });

  // Quick Apply Simulation Form State
  const [applyState, setApplyState] = useState({
    fullName: 'Alex River',
    email: 'alex.river@berkeley.edu',
    github: 'github.com/alexriver',
    portfolio: 'alexriver.dev',
    note: 'Excited about the role! I have built 4 production apps with React and TypeScript.',
  });

  // Filtered & Sorted Internships Computation
  const filteredInternships = useMemo(() => {
    let result = ALL_INTERNSHIPS.filter((item) => {
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
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesCategory) return false;
      }
      // Location type match
      if (searchLocation !== 'all') {
        if (item.locationType !== searchLocation) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'stipend-high') {
      result = [...result].sort((a, b) => (b.stipendNum || 0) - (a.stipendNum || 0));
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'featured') {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [activeCategory, searchKeyword, searchLocation, sortBy]);

  // Handle Save / Bookmark
  const handleToggleSave = (id) => {
    setSavedInternships((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        notify.info('Internship removed from saved tracker.');
      } else {
        next.add(id);
        notify.success('Opportunity saved! Access it in your saved tracker.');
      }
      return next;
    });
  };

  // Quick Apply Handler
  const handleQuickApplySubmit = (e) => {
    e.preventDefault();
    notify.success(`Application sent to ${selectedInternship.company}! Confirmation email dispatched.`);
    setSelectedInternship(null);
    setModalActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title="InternHub — Find the Right Internship. Build Your Future."
        description="Discover 2,000+ verified tech internships at top startups and Fortune 500 companies. Apply directly with your verified student profile and track every application in real time."
        canonicalPath="/"
        ogType="website"
      />

      {/* Global Navigation */}
      <Navbar onAuthModalOpen={(mode) => setAuthModal({ isOpen: true, mode })} />

      <main id="main-content" className="flex-1" aria-label="InternHub homepage">
        {/* ========================================================================= */}
        {/* HERO SECTION WITH AMBIENT DESIGN & INTERACTIVE SEARCH ENGINE              */}
        {/* ========================================================================= */}
        <section aria-labelledby="hero-headline" className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-dot-grid">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-violet-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
            {/* Live Metrics Ticker Banner */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-brand-200/90 bg-white/90 backdrop-blur-md shadow-sm text-xs sm:text-sm font-medium text-slate-700 hover:border-brand-300 transition-all cursor-pointer">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-brand-700">Summer 2027 Cohort Live</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-500">48 new roles added today</span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="hidden md:inline text-emerald-600 font-mono font-semibold">Median: $55/hr</span>
              <ChevronRight className="w-3.5 h-3.5 text-brand-600 ml-0.5" />
            </div>

            {/* Main Headline */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1
                id="hero-headline"
                className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12] sm:leading-[1.08]"
              >
                Find the right internship.{' '}
                <span className="text-gradient block sm:inline">Build your future.</span>
              </h1>
              <p className="text-sm sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                Discover curated opportunities at top tech companies, apply directly with a verified
                academic profile, and track your career journey with zero ghosting.
              </p>
            </div>

            {/* Comprehensive Interactive Search Engine Pill */}
            <div className="max-w-4xl mx-auto pt-2">
              <div className="p-2 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-card-elevated flex flex-col md:flex-row items-center gap-2.5 transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-400">
                {/* Keyword Search Input */}
                <div className="w-full md:flex-1 relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by role, company, or tech stack (e.g. React, Python, Stripe, AI)..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Workplace Filter */}
                <div className="w-full md:w-44 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-3 flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 mr-1.5 shrink-0 hidden sm:inline" />
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    aria-label="Filter by workplace type"
                    className="w-full text-xs sm:text-sm font-medium text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer py-2 focus:outline-none"
                  >
                    <option value="all">All Workplaces</option>
                    <option value="Remote">🌐 Remote Only</option>
                    <option value="Hybrid">🏢 Hybrid</option>
                    <option value="On-site">📍 On-site</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="w-full md:w-48 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-3">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    aria-label="Filter by engineering category"
                    className="w-full text-xs sm:text-sm font-medium text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer py-2 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="AI / ML">AI & Machine Learning</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>

                {/* Search Button */}
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    const el = document.getElementById('featured');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto shrink-0 px-7 py-3 font-semibold shadow-md shadow-brand-600/20 rounded-xl"
                >
                  Find Roles
                </Button>
              </div>

              {/* 1-Click Trending Quick Tags */}
              <div className="pt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending:
                </span>
                {TRENDING_SEARCHES.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      if (tag.query) setSearchKeyword(tag.query);
                      if (tag.location) setSearchLocation(tag.location);
                      const el = document.getElementById('featured');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all font-medium text-[11px] shadow-sm"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Proof & University Crests */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Student user"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Student user"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                  alt="Student user"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Student user"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5 Rating</span>
                  <span className="text-slate-400 font-normal">• 10,000+ Students Placed</span>
                </div>
                <p className="text-[11px] text-slate-500">Stanford • MIT • UC Berkeley • Waterloo • CMU • Georgia Tech</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* TOP COMPANIES HIRING ROTATING MARQUEE BANNER                              */}
        {/* ========================================================================= */}
        <section aria-label="Top hiring tech companies" className="border-y border-slate-200/80 bg-white/90 backdrop-blur-md py-4 overflow-hidden relative">
          <div className="flex items-center">
            {/* Left Static Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-8 pr-6 border-r border-slate-200/80 shrink-0 z-10 bg-white/95">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                Active Hiring Cohorts:
              </span>
            </div>

            {/* Rotating Marquee Track with gradient fade masks */}
            <div className="flex-1 overflow-hidden marquee-mask relative">
              <div className="animate-marquee-infinite flex items-center gap-4 sm:gap-6 whitespace-nowrap py-1">
                {[...TOP_COMPANIES, ...TOP_COMPANIES, ...TOP_COMPANIES].map((company, idx) => (
                  <button
                    key={`${company.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSearchKeyword(company.name);
                      const el = document.getElementById('featured');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-brand-300 hover:shadow-card-hover transition-all group shrink-0"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                      <CompanyLogoIcon name={company.name} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors block">
                        {company.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono font-semibold block">
                        {company.roles}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CURATED TECH INTERNSHIPS DISCOVERY HUB                                    */}
        {/* ========================================================================= */}
        <section id="featured" aria-labelledby="featured-heading" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header with Title and Layout Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">
                Curated Opportunities
              </Badge>
              <h2 id="featured-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Explore Verified Tech Internships
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Directly vetted roles offering transparent compensation, real-time status tracking, and 1-on-1 engineering mentorship.
              </p>
            </div>

            {/* View Switcher & Sorting Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort internships"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="featured">✨ Featured First</option>
                  <option value="stipend-high">💰 Highest Stipend</option>
                  <option value="title">🔤 Title (A-Z)</option>
                </select>
              </div>

              {/* Grid / List Layout Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewLayout('grid')}
                  aria-label="Grid layout view"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'grid'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('list')}
                  aria-label="List layout view"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'list'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? ALL_INTERNSHIPS.length
                  : ALL_INTERNSHIPS.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shadow-sm ${
                    isActive
                      ? 'bg-brand-600 border-brand-600 text-white shadow-brand-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicators Bar */}
          {(searchKeyword || searchLocation !== 'all' || activeCategory !== 'all') && (
            <div className="flex items-center justify-between bg-brand-50/60 border border-brand-200/80 rounded-xl px-4 py-2.5 text-xs text-brand-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Active Filters:</span>
                {searchKeyword && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-brand-200 text-brand-700">
                    Keyword: "{searchKeyword}"
                    <button onClick={() => setSearchKeyword('')} aria-label="Clear keyword filter">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                    </button>
                  </span>
                )}
                {searchLocation !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-brand-200 text-brand-700">
                    Location: {searchLocation}
                    <button onClick={() => setSearchLocation('all')} aria-label="Clear location filter">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                    </button>
                  </span>
                )}
                {activeCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-brand-200 text-brand-700">
                    Category: {activeCategory}
                    <button onClick={() => setActiveCategory('all')} aria-label="Clear category filter">
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setSearchLocation('all');
                  setActiveCategory('all');
                }}
                className="font-semibold text-brand-700 hover:text-brand-900 underline shrink-0 ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Internships Output (Grid or List Layout) */}
          {filteredInternships.length > 0 ? (
            <div
              className={
                viewLayout === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-3'
              }
            >
              {filteredInternships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  layout={viewLayout}
                  isSaved={savedInternships.has(internship.id)}
                  onToggleSave={handleToggleSave}
                  onViewDetails={(item) => {
                    setSelectedInternship(item);
                    setModalActiveTab('overview');
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching internships found"
              description="Try adjusting your keyword search query, workplace filter, or selecting another engineering domain."
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
        {/* INTERACTIVE STIPEND & COMPENSATION EXPLORER (SENIOR UX FEATURE)          */}
        {/* ========================================================================= */}
        <section aria-labelledby="comp-explorer-heading" className="py-16 sm:py-24 border-t border-slate-200/80 bg-gradient-to-b from-slate-100/60 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="success" size="sm">
                <DollarSign className="w-3 h-3 mr-1" /> Transparent Market Insights
              </Badge>
              <h2 id="comp-explorer-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                2026 Tech Internship Stipend Explorer
              </h2>
              <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                Real compensation data aggregated from verified student offers across Fortune 500 & top engineering startups.
              </p>
            </div>

            {/* Interactive Domain Switcher */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {Object.keys(COMPENSATION_DATA).map((categoryKey) => {
                const isSelected = activeCompCategory === categoryKey;
                return (
                  <button
                    key={categoryKey}
                    type="button"
                    onClick={() => setActiveCompCategory(categoryKey)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {categoryKey}
                  </button>
                );
              })}
            </div>

            {/* Active Compensation Insights Bento Card */}
            {(() => {
              const data = COMPENSATION_DATA[activeCompCategory];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200/90 shadow-card-elevated p-6 sm:p-10">
                  {/* Left Column: Key Figures */}
                  <div className="lg:col-span-5 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
                    <div>
                      <span className="text-xs font-mono font-semibold uppercase text-brand-600 tracking-wider">
                        Domain Overview
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                        {data.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                        {data.insights}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                        <span className="text-xs text-emerald-700 font-medium">Median Hourly</span>
                        <div className="text-2xl font-extrabold text-emerald-800 font-mono tracking-tight">
                          {data.medianHourly}
                        </div>
                        <span className="text-[11px] text-emerald-600">{data.monthlyEquivalent}</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 space-y-1">
                        <span className="text-xs text-brand-700 font-medium">Top 95th Percentile</span>
                        <div className="text-2xl font-extrabold text-brand-800 font-mono tracking-tight">
                          {data.topPay}
                        </div>
                        <span className="text-[11px] text-brand-600">Tier 1 Frontier Labs</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => {
                        setActiveCategory(activeCompCategory);
                        const el = document.getElementById('featured');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full font-semibold"
                    >
                      Explore {activeCompCategory} Roles
                    </Button>
                  </div>

                  {/* Right Column: Breakdown & Interview Timeline */}
                  <div className="lg:col-span-7 space-y-6 lg:pl-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-xs font-semibold text-slate-700 block">
                          🌐 Remote Flexibility
                        </span>
                        <p className="text-base font-bold text-slate-900">{data.remotePercent}</p>
                        <p className="text-xs text-slate-500">
                          Companies offer dedicated home office hardware allowances.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <span className="text-xs font-semibold text-slate-700 block">
                          ⏱️ Typical Interview Process
                        </span>
                        <p className="text-xs font-semibold text-slate-900 font-mono">{data.avgRounds}</p>
                        <p className="text-xs text-slate-500">
                          Average decision turnaround: 8 to 14 business days.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Top Paying Employers in this Specialization:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {data.topHiring.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-800 text-xs shadow-sm"
                          >
                            <Building2 className="w-3.5 h-3.5 text-brand-600" />
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS (INTERACTIVE 4-STEP WORKFLOW)                                */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-16 sm:py-24 border-t border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="primary" size="sm">
                Transparent Pipeline
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                How InternHub Works
              </h2>
              <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
                From discovery to your first verified offer letter — streamlined in four simple steps.
              </p>

              {/* Switch between Student and Recruiter Workflow */}
              <div className="pt-2 flex items-center justify-center">
                <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 inline-flex">
                  <button
                    type="button"
                    onClick={() => setWorkflowTab('students')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workflowTab === 'students'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    For Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflowTab('recruiters')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workflowTab === 'recruiters'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    For Recruiters
                  </button>
                </div>
              </div>
            </div>

            {workflowTab === 'students' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Step 01 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-brand-600/20 font-mono block">01</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Create Verified Profile</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Set up your verified profile with university details, GitHub repo showcase, and target domain preferences.
                  </p>
                </div>

                {/* Step 02 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-brand-600/20 font-mono block">02</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Discover Curated Roles</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Filter by transparent hourly stipends, remote flexibility, required tech stacks, and live hiring timelines.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-brand-600/20 font-mono block">03</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">1-Click Direct Apply</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Submit applications with your Cloudinary CDN resume directly to verified engineering managers with zero redirect traps.
                  </p>
                </div>

                {/* Step 04 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-brand-600/20 font-mono block">04</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Live Status Tracker</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Receive real-time notifications on shortlists, interview invites, and offers without ghosting anxiety.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Recruiter Step 01 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-emerald-600/20 font-mono block">01</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Post Internship Free</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Publish your summer or co-op cohort in 2 minutes with salary benchmarks, skills, and timeline tags.
                  </p>
                </div>

                {/* Recruiter Step 02 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-emerald-600/20 font-mono block">02</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Verified Talent Pool</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Review applicants from 150+ accredited engineering schools with verified GPA, coursework, and GitHub commits.
                  </p>
                </div>

                {/* Recruiter Step 03 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-emerald-600/20 font-mono block">03</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">1-Click Scheduling</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Shortlist, reject, or schedule live technical screens seamlessly with built-in candidate messaging.
                  </p>
                </div>

                {/* Recruiter Step 04 */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 relative group hover:border-brand-300 hover:shadow-card-hover transition-all">
                  <span className="text-4xl font-extrabold text-emerald-600/20 font-mono block">04</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Fill Cohort 3x Faster</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Issue offer letters, track acceptance rates, and build lasting university relationships.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RECRUITER COMMAND CENTER BENTO SHOWCASE                                   */}
        {/* ========================================================================= */}
        <section id="companies" aria-labelledby="companies-heading" className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> For University Talent Teams
                </div>
                <h2 id="companies-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Hire top engineering interns with zero friction.
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Connect with verified undergraduate and graduate candidates from top engineering programs. Filter by real technical skills, manage candidate pipelines, and schedule interviews seamlessly.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Verified Student Profiles</span>
                      <span className="text-xs text-slate-400">
                        Enrollment, GPA, coursework, and GitHub contributions are pre-verified.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Direct Candidate Pipeline</span>
                      <span className="text-xs text-slate-400">
                        Shortlist, review resumes, or schedule interviews in 1 click.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4 flex-wrap">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => setAuthModal({ isOpen: true, mode: 'recruiter' })}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 shadow-glow"
                  >
                    Post an Internship Free
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/companies')}
                    className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                  >
                    Explore Company Hub
                  </Button>
                </div>
              </div>

              {/* Recruiter Live Mockup Dashboard Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-slate-800/90 border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Recruiter Command Center</h4>
                        <p className="text-xs text-slate-400">Summer 2027 Engineering Cohort</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Pipeline
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Total Applicants</span>
                        <span className="text-lg font-bold text-white font-mono">148 Candidates</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-bold">
                        +24 Today
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Technical Screens Scheduled</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">18 In Progress</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        88% Acceptance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SOCIAL PROOF & TESTIMONIALS                                               */}
        {/* ========================================================================= */}
        <section aria-labelledby="testimonials-heading" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="primary" size="sm">
              Community Endorsements
            </Badge>
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Loved by Students & Engineering Leaders
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
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
        {/* FREE STUDENT CAREER RESOURCES                                             */}
        {/* ========================================================================= */}
        <section id="resources" aria-labelledby="resources-heading" className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div>
                <Badge variant="primary" size="sm" className="mb-2">
                  Knowledge Hub
                </Badge>
                <h2 id="resources-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Free Student Career Resources
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Handcrafted guides on technical interviewing, resume formatting, and internship compensation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable className="border-slate-200/90 bg-white shadow-sm p-6 space-y-3 rounded-2xl group cursor-pointer">
                <span className="text-xs font-mono text-brand-600 font-semibold">GUIDE • 8 MIN READ</span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  The Complete 2026 Tech Resume Blueprint
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  How to highlight personal projects, open-source contributions, and relevant coursework to pass automated ATS screenings.
                </p>
              </Card>

              <Card hoverable className="border-slate-200/90 bg-white shadow-sm p-6 space-y-3 rounded-2xl group cursor-pointer">
                <span className="text-xs font-mono text-emerald-600 font-semibold">INTERVIEW PREP • 12 MIN READ</span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Cracking the Live Technical Coding Screen
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Essential algorithms, system design trade-offs, and communication strategies for 45-minute live coding interviews.
                </p>
              </Card>

              <Card hoverable className="border-slate-200/90 bg-white shadow-sm p-6 space-y-3 rounded-2xl group cursor-pointer">
                <span className="text-xs font-mono text-amber-600 font-semibold">INDEX • UPDATED WEEKLY</span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  2026 Software Internship Stipend Index
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Transparent hourly rates, relocation benefits, and housing stipends across top tech hubs including SF, NYC, and Seattle.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION                                                     */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to accelerate your tech career?
              </h2>
              <p className="text-base sm:text-lg text-brand-100 max-w-xl mx-auto leading-relaxed">
                Join over 10,000 students discovering curated opportunities, tracking applications in real-time, and landing dream roles.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                className="w-full sm:w-auto px-8 bg-white text-brand-700 hover:bg-brand-50 border-white shadow-xl font-bold"
              >
                Create Free Profile
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('featured');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 text-white border-white/40 hover:bg-white/10 hover:text-white"
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
      {/* ENHANCED TABBED OPPORTUNITY DETAIL & 1-CLICK APPLY MODAL                  */}
      {/* ========================================================================= */}
      {selectedInternship && (
        <Modal
          isOpen={Boolean(selectedInternship)}
          onClose={() => setSelectedInternship(null)}
          size="lg"
        >
          <ModalHeader>
            <div className="flex items-start justify-between gap-3 w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 p-2 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                  {selectedInternship.companyLogo ? (
                    <img
                      src={selectedInternship.companyLogo}
                      alt={selectedInternship.company}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-brand-600" />
                  )}
                </div>
                <div>
                  <ModalTitle>{selectedInternship.title}</ModalTitle>
                  <ModalDescription>
                    {selectedInternship.company} • {selectedInternship.location} ({selectedInternship.locationType})
                  </ModalDescription>
                </div>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-2 pt-4 border-b border-slate-200 w-full text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalActiveTab('overview')}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  modalActiveTab === 'overview'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Overview & Responsibilities
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('perks')}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  modalActiveTab === 'perks'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Perks & Mentorship
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('apply')}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  modalActiveTab === 'apply'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                🚀 1-Click Apply
              </button>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-5 max-h-[60vh] overflow-y-auto">
            {modalActiveTab === 'overview' && (
              <>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs">
                    <span className="text-slate-500 block">Stipend Rate</span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono">
                      {selectedInternship.stipend}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-xs">
                    <span className="text-slate-500 block">Workplace</span>
                    <span className="text-slate-900 font-bold">{selectedInternship.locationType}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4 text-xs">
                    <span className="text-slate-500 block">Category</span>
                    <span className="text-slate-900 font-bold">{selectedInternship.category}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Role Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedInternship.description}
                  </p>
                </div>

                {selectedInternship.responsibilities && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc list-inside">
                      {selectedInternship.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedInternship.requirements && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Requirements & Qualifications
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc list-inside">
                      {selectedInternship.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Target Tech Stack
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedInternship.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {modalActiveTab === 'perks' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1">
                  <span className="font-bold block">Verified Employer Benefits</span>
                  <p className="text-brand-700">
                    All listed perks are guaranteed by {selectedInternship.company} for the Summer 2027 cohort.
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedInternship.perks?.map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  )) || (
                    <p className="text-xs text-slate-500">Mentorship, housing support, and equipment provided.</p>
                  )}
                </div>
              </div>
            )}

            {modalActiveTab === 'apply' && (
              <form onSubmit={handleQuickApplySubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  ⚡ <strong>1-Click Instant Application:</strong> Your verified profile data and uploaded resume will be delivered immediately to the hiring manager.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    value={applyState.fullName}
                    onChange={(e) => setApplyState({ ...applyState, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Student Email"
                    type="email"
                    value={applyState.email}
                    onChange={(e) => setApplyState({ ...applyState, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="GitHub Profile"
                    value={applyState.github}
                    onChange={(e) => setApplyState({ ...applyState, github: e.target.value })}
                  />
                  <Input
                    label="Portfolio / Website"
                    value={applyState.portfolio}
                    onChange={(e) => setApplyState({ ...applyState, portfolio: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Short Note for Hiring Team
                  </label>
                  <textarea
                    rows={3}
                    value={applyState.note}
                    onChange={(e) => setApplyState({ ...applyState, note: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Introduce yourself and share why you are excited for this role..."
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  rightIcon={<Send className="w-4 h-4" />}
                  className="font-bold"
                >
                  Submit Application to {selectedInternship.company}
                </Button>
              </form>
            )}
          </ModalBody>

          <ModalFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleSave(selectedInternship.id)}
              >
                {savedInternships.has(selectedInternship.id) ? 'Saved in Tracker' : 'Save Opportunity'}
              </Button>

              {modalActiveTab !== 'apply' && (
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setModalActiveTab('apply')}
                >
                  Apply Directly
                </Button>
              )}
            </div>
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
            <div className="text-xs text-slate-500">
              By creating an account, you agree to the InternHub{' '}
              <a href="#" className="text-brand-600 underline">Terms</a> and{' '}
              <a href="#" className="text-brand-600 underline">Privacy Policy</a>.
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
