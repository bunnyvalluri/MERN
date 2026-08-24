/**
 * CompanyDetailPage — Enterprise Company Intelligence & Internship Hub.
 * Deep engineering insights, compensation metrics, culture perks, interview roadmap,
 * and live application workflows for top tech employers.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import InternshipQuickApplyModal from '../../internships/components/InternshipQuickApplyModal.jsx';
import { getCompanyBySlugOrId } from '../services/companiesService.js';
import { Button, Badge } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Globe2,
  ExternalLink,
  Star,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Bot,
  Zap,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  Terminal,
  FileCode,
  Sparkles,
  HelpCircle,
  Scale,
  Send,
} from 'lucide-react';

export function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const studentProfile = useSelector((state) => state.student?.profile);

  // Active Tab state
  const [activeTab, setActiveTab] = useState('INTERNSHIPS'); // 'INTERNSHIPS' | 'TECH_STACK' | 'CULTURE' | 'INTERVIEW' | 'ABOUT'

  // Candidate Target Skills
  const userSkills = useMemo(() => {
    try {
      const stored = localStorage.getItem('internhub_user_target_skills');
      if (stored) return JSON.parse(stored);
      if (studentProfile?.skills?.length > 0) return studentProfile.skills;
      return ['Python', 'React', 'PyTorch'];
    } catch {
      return ['Python', 'React', 'PyTorch'];
    }
  }, [studentProfile]);

  // Fetch enriched company intelligence
  const company = useMemo(() => {
    return getCompanyBySlugOrId(id, userSkills);
  }, [id, userSkills]);

  // Saved company state
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const raw = localStorage.getItem('internhub_saved_companies');
      if (!raw) return false;
      const set = new Set(JSON.parse(raw));
      return set.has(id) || (company && set.has(company.slug));
    } catch {
      return false;
    }
  });

  // Saved Jobs state
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const raw = localStorage.getItem('internhub_saved_internships');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Quick Apply Modal state
  const [selectedQuickApplyJob, setSelectedQuickApplyJob] = useState(null);
  const [isQuickApplyModalOpen, setIsQuickApplyModalOpen] = useState(false);

  // Filter inside company internships
  const [roleSearch, setRoleSearch] = useState('');

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-600">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Company Profile Not Found
          </h1>
          <p className="text-slate-600 max-w-md mx-auto text-sm">
            We couldn't locate an employer profile for "{id}". Explore our directory of 500+ verified employers.
          </p>
          <Link to="/companies">
            <Button variant="primary" size="md">
              Return to Company Directory
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const maxStipend = company.compensation?.maxMonthlyStipend || company.compensation?.avgMonthlyStipend;
  const rating = company.ratings?.overall || 4.8;
  const openRoles = company.activeInternships || [];

  const filteredRoles = openRoles.filter((r) => {
    if (!roleSearch.trim()) return true;
    const q = roleSearch.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.skills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleToggleSaveCompany = () => {
    try {
      const raw = localStorage.getItem('internhub_saved_companies');
      const set = raw ? new Set(JSON.parse(raw)) : new Set();
      const key = company.slug || company.id;
      if (set.has(key)) {
        set.delete(key);
        setIsSaved(false);
        notify.info(`Removed ${company.name} from saved employers.`);
      } else {
        set.add(key);
        setIsSaved(true);
        notify.success(`Saved ${company.name} to your employer radar!`);
      }
      localStorage.setItem('internhub_saved_companies', JSON.stringify([...set]));
    } catch {
      // ignore
    }
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${company.name} Internships & Hiring Profile | InternHub`,
        text: `Check out ${company.name}'s engineering tech stack, intern compensation, and open roles on InternHub.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify.success('Link copied to clipboard!');
    }
  };

  const handleToggleSaveJob = (role) => {
    const roleId = role._id || role.id;
    const nextSet = new Set(savedJobIds);
    if (nextSet.has(roleId)) {
      nextSet.delete(roleId);
      notify.info(`Removed ${role.title} from saved.`);
    } else {
      nextSet.add(roleId);
      notify.success(`Saved ${role.title}!`);
    }
    setSavedJobIds(nextSet);
    try {
      localStorage.setItem('internhub_saved_internships', JSON.stringify([...nextSet]));
    } catch {
      // ignore
    }
  };

  const companyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${company.name} Internships & Engineering Culture | InternHub`,
    description: company.description,
    url: `https://internhub.dev/companies/${company.slug}`,
    mainEntity: {
      '@type': 'Organization',
      name: company.name,
      url: company.website,
      logo: company.logo,
      description: company.description,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title={`${company.name} Internships, Tech Stack & Hiring | InternHub`}
        description={`View open Summer 2026 internship roles, engineering culture, salary benchmark, and interview stages at ${company.name}.`}
        canonicalPath={`/companies/${company.slug}`}
        ogType="website"
        jsonLd={companyJsonLd}
      />

      <Navbar />

      <main id="main-content" className="flex-1 pb-24" aria-label={`${company.name} profile`}>
        {/* ── 1. Clean Light Hero Cover Banner ───────────────────────────────── */}
        <section className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100/50 pt-8 pb-12 sm:pb-16 overflow-hidden border-b border-slate-200/90">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-500/6 rounded-full blur-[120px] pointer-events-none -z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            {/* Back Navigation */}
            <div>
              <Link
                to="/companies"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Companies
              </Link>
            </div>

            {/* Profile Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
              <div className="flex items-start sm:items-center gap-5">
                <CompanyLogo
                  companyName={company.name}
                  slug={company.slug}
                  logo={company.logo}
                  website={company.website}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl shadow-sm border border-slate-200 bg-white shrink-0"
                />

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {company.name}
                    </h1>
                    {company.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        Verified Employer
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-2xl leading-relaxed">
                    {company.tagline || company.description}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="font-semibold text-slate-800">{company.category}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'San Francisco, CA'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {company.companySize || '1,000+'} employees
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/90 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Globe2 className="w-4 h-4 text-slate-500" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 transition-colors shadow-2xs cursor-pointer"
                  title="Share profile"
                  aria-label="Share company profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleSaveCompany}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border cursor-pointer ${
                    isSaved
                      ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs'
                      : 'bg-brand-600 hover:bg-brand-700 text-white border-brand-600 shadow-xs'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isSaved ? 'Saved to Radar' : 'Save Employer'}</span>
                </button>
              </div>
            </div>

            {/* AI Compatibility Match Pill */}
            {company.aiMatch && (
              <div className="mt-3 p-3 rounded-2xl bg-brand-50/80 border border-brand-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-brand-950 block">
                      {company.aiMatch.score}% AI Candidate Compatibility Fit
                    </span>
                    <span className="text-2xs text-brand-700 font-medium">
                      Strong overlap with your skills in {company.aiMatch.matchedSkills.join(', ')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('INTERNSHIPS')}
                  className="text-2xs font-bold text-brand-700 hover:text-brand-900 underline cursor-pointer"
                >
                  View Recommended Roles →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. Key Metrics Ribbon ────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
              <div className="py-2 sm:py-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Top Monthly Stipend
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block mt-0.5">
                  {maxStipend ? `$${maxStipend.toLocaleString()}/mo` : 'Competitive'}
                </span>
                <span className="text-2xs text-emerald-600 font-semibold block">
                  {company.compensation?.tier || 'Tier-1 Elite'}
                </span>
              </div>

              <div className="py-2 sm:py-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Intern Satisfaction
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 inline-flex items-center justify-center gap-1.5 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {rating} / 5.0
                </span>
                <span className="text-2xs text-slate-500 font-medium block">
                  Based on {company.ratings?.reviewCount || 250}+ intern reviews
                </span>
              </div>

              <div className="py-2 sm:py-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Return Offer Rate
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 block mt-0.5">
                  {company.ratings?.returnOfferRate || 88}%
                </span>
                <span className="text-2xs text-slate-500 font-medium block">
                  Intern-to-Full-Time Offer Rate
                </span>
              </div>

              <div className="py-2 sm:py-0">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 block">
                  AI Innovation Index
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-brand-600 inline-flex items-center justify-center gap-1.5 mt-0.5">
                  <Zap className="w-4 h-4 text-brand-500" />
                  {company.aiInnovationIndex || 95} / 100
                </span>
                <span className="text-2xs text-slate-500 font-medium block">
                  Frontier Systems & Research
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Navigation Tabs Bar ───────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none py-1 text-xs sm:text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('INTERNSHIPS')}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'INTERNSHIPS'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Open Internships ({openRoles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TECH_STACK')}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'TECH_STACK'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Engineering & Tech Stack</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CULTURE')}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'CULTURE'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Culture & Perks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('INTERVIEW')}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'INTERVIEW'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Interview Roadmap</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ABOUT')}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ABOUT'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>About & Offices</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Main Body & Tab Content + Sidebar ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Tab Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* TAB 1: OPEN INTERNSHIPS */}
              {activeTab === 'INTERNSHIPS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Active Internship Opportunities at {company.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Summer and Fall 2026 undergraduate, graduate, and Ph.D. engineering openings
                      </p>
                    </div>

                    {openRoles.length > 3 && (
                      <input
                        type="text"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        placeholder="Search company roles..."
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-xs"
                      />
                    )}
                  </div>

                  {filteredRoles.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRoles.map((role) => {
                        const isJobSaved = savedJobIds.has(role._id || role.id);
                        return (
                          <div
                            key={role._id || role.id}
                            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 transition-all shadow-xs hover:shadow-card space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1">
                                <Link
                                  to={`/internships/${role._id || role.id}`}
                                  className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors"
                                >
                                  {role.title}
                                </Link>
                                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                  <span className="font-semibold text-slate-700">{role.category}</span>
                                  <span>•</span>
                                  <span>{role.remote || 'Remote'}</span>
                                  <span>•</span>
                                  <span>{role.type || 'Full-Time'}</span>
                                  <span>•</span>
                                  <span>{role.duration || 'Summer 2026'}</span>
                                </div>
                              </div>

                              <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl shrink-0 self-start">
                                {role.stipend?.amount ? `$${role.stipend.amount.toLocaleString()}/mo` : 'Competitive'}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
                              {role.description}
                            </p>

                            {/* Skills & Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(role.skills || []).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-2xs font-mono font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSaveJob(role)}
                                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                    isJobSaved
                                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                                  }`}
                                  title={isJobSaved ? 'Saved' : 'Save opportunity'}
                                >
                                  <Bookmark className={`w-4 h-4 ${isJobSaved ? 'fill-amber-500' : ''}`} />
                                </button>

                                <Link to={`/internships/${role._id || role.id}`}>
                                  <Button variant="secondary" size="sm" className="text-xs px-3">
                                    Details
                                  </Button>
                                </Link>

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedQuickApplyJob(role);
                                    setIsQuickApplyModalOpen(true);
                                  }}
                                  className="text-xs px-3.5 shadow-2xs"
                                  leftIcon={<Send className="w-3.5 h-3.5" />}
                                >
                                  Quick Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <p className="font-bold text-slate-800">
                        No active internship postings matching query
                      </p>
                      <p className="text-xs text-slate-500">
                        Check back soon or explore related companies in the sidebar.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TECH STACK & ARCHITECTURE */}
              {activeTab === 'TECH_STACK' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-brand-600" />
                      Engineering Architecture & Stack
                    </h2>
                    <p className="text-xs text-slate-600">
                      Core languages, frameworks, compute engines, and distributed systems utilized by {company.name} engineering teams.
                    </p>
                  </div>

                  {company.engineeringPhilosophy && (
                    <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 space-y-1">
                      <span className="text-2xs font-extrabold uppercase tracking-wider text-brand-700">
                        Engineering Philosophy
                      </span>
                      <p className="text-sm font-medium text-brand-950 leading-relaxed">
                        "{company.engineeringPhilosophy}"
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Production Languages & Tools
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(company.techStack || ['Python', 'TypeScript', 'Go', 'Kubernetes', 'PostgreSQL', 'AWS']).map((tech) => (
                        <div
                          key={tech}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5 font-mono text-xs font-bold text-slate-800"
                        >
                          <FileCode className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CULTURE & PERKS */}
              {activeTab === 'CULTURE' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Intern Culture & Benefits Package
                    </h2>
                    <p className="text-xs text-slate-600">
                      What you receive as an engineering intern at {company.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(company.perks || [
                      '$2,500/mo Housing Allowance or Luxury Corporate Housing',
                      'Comprehensive Medical, Dental, and Mental Health Coverage',
                      'Top-spec M3 Max MacBook Pro or Linux Rig',
                      '1:1 Dedicated Staff Engineer Mentorship Program',
                      'Return-to-Full-Time New Grad Offer Fast Track',
                    ]).map((perk, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVIEW ROADMAP */}
              {activeTab === 'INTERVIEW' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                        Interview Process & Preparation Roadmap
                      </h2>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        Difficulty: {company.interviewDifficulty || 'Hard (4.3/5.0)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Typical step-by-step interview pipeline for software engineering & AI internship candidates.
                    </p>
                  </div>

                  {/* Pipeline Timeline */}
                  <div className="space-y-4 pt-2">
                    {(company.interviewRoadmap || [
                      { stage: 1, title: 'Resume & Portfolio Review', duration: '1-3 days', description: 'Review of GitHub code, previous internships, and academic projects.' },
                      { stage: 2, title: 'Technical Coding OA', duration: '60 mins', description: 'Algorithmic problem solving and data structure optimization.' },
                      { stage: 3, title: 'Live Technical Screen', duration: '60 mins', description: 'Pair programming and interactive systems discussion.' },
                      { stage: 4, title: 'Virtual Onsite & Team Match', duration: '3 hours', description: 'Deep dive into distributed systems, domain architecture, and cultural fit.' },
                    ]).map((step) => (
                      <div
                        key={step.stage}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4"
                      >
                        <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {step.stage}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                            <span className="text-2xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              {step.duration}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {company.alumniNetwork && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <strong className="text-slate-900 block font-bold mb-1">Common University Feeder Networks:</strong>
                      {company.alumniNetwork}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ABOUT & OFFICES */}
              {activeTab === 'ABOUT' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-brand-600" />
                      About {company.name} & Global Hubs
                    </h2>
                    <p className="text-xs text-slate-600">
                      Background, founding mission, and campus recruiting hubs.
                    </p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {company.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Recruitment & Office Locations
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(company.locations || [
                        company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'San Francisco, CA',
                        'Remote Global',
                      ]).map((loc, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-800"
                        >
                          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{loc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {company.careersUrl && (
                    <div className="pt-2">
                      <a
                        href={company.careersUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                      >
                        <span>Visit {company.name} Official Careers Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 Col: Similar Companies & Fast Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Employer Overview
                </h3>

                <div className="space-y-3 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Founded Year</span>
                    <span className="font-bold text-slate-900">{company.foundedYear || 2015}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Headquarters</span>
                    <span className="font-bold text-slate-900">
                      {company.location?.city || 'San Francisco, CA'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Work Policy</span>
                    <span className="font-bold text-slate-900">
                      {company.workPolicy === 'REMOTE_FIRST' ? 'Remote-First' : company.workPolicy === 'HYBRID' ? 'Hybrid' : 'In-Office'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Company Size</span>
                    <span className="font-bold text-slate-900">{company.companySize || '1,000+'}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Open Internships</span>
                    <span className="font-extrabold text-emerald-600">{openRoles.length} Active</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs shadow-2xs"
                    onClick={() => setActiveTab('INTERNSHIPS')}
                  >
                    View All {openRoles.length} Open Roles
                  </Button>
                </div>
              </div>

              {/* Similar & Related Companies */}
              {company.similarCompanies && company.similarCompanies.length > 0 && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Similar Tech Employers
                  </h3>

                  <div className="space-y-3">
                    {company.similarCompanies.map((sim) => (
                      <Link
                        key={sim.slug || sim.id}
                        to={`/companies/${sim.slug}`}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyLogo
                            companyName={sim.name}
                            slug={sim.slug}
                            logo={sim.logo}
                            website={sim.website}
                            className="w-10 h-10 shadow-2xs rounded-xl"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                              {sim.name}
                            </h4>
                            <span className="text-2xs text-slate-500 truncate block">
                              {sim.category}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Quick Apply Modal ─────────────────────────────────────────────────── */}
      <InternshipQuickApplyModal
        isOpen={isQuickApplyModalOpen}
        onClose={() => setIsQuickApplyModalOpen(false)}
        internship={selectedQuickApplyJob}
        onAppliedSuccessfully={() => {
          setIsQuickApplyModalOpen(false);
          notify.success('Application successfully submitted with verified profile!');
        }}
      />

      <Footer />
    </div>
  );
}

export default CompanyDetailPage;
