/**
 * CompaniesPage — Production Enterprise Discovery & Intelligence Portal for Employers.
 * Features multi-dimensional faceted search, real-time dynamic internship synchronization,
 * AI Smart Match compatibility radar, side-by-side employer comparison matrix,
 * quick preview drawer, and direct application workflows.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import CompanyCard from '../components/CompanyCard.jsx';
import CompanyListRow from '../components/CompanyListRow.jsx';
import CompanyFilters from '../components/CompanyFilters.jsx';
import CompanySmartMatchWidget from '../components/CompanySmartMatchWidget.jsx';
import CompanyPreviewDrawer from '../components/CompanyPreviewDrawer.jsx';
import CompanyComparisonDock from '../components/CompanyComparisonDock.jsx';
import CompanyComparisonModal from '../components/CompanyComparisonModal.jsx';
import CompanySpotlightBanner from '../components/CompanySpotlightBanner.jsx';
import InternshipQuickApplyModal from '../../internships/components/InternshipQuickApplyModal.jsx';
import {
  queryCompanies,
  getPlatformCompanyStats,
  getAllEnrichedCompanies,
  getAllEnrichedCompaniesAsync,
} from '../services/companiesService.js';
import { Button, Badge, Pagination, EmptyState } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  Building2,
  ShieldCheck,
  Users,
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  DollarSign,
  Star,
  Scale,
  Award,
  Globe2,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

const COMPANIES_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Top Tech Companies & Frontier AI Labs Hiring Interns | InternHub',
  description:
    'Explore 500+ verified engineering organizations and AI research labs actively hiring undergraduate and graduate interns. Compare stipends, tech stacks, and culture.',
  url: 'https://internhub.dev/companies',
  isPartOf: {
    '@type': 'WebSite',
    name: 'InternHub',
    url: 'https://internhub.dev/',
  },
};

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Employers', icon: Sparkles },
  { id: 'AI & Machine Learning', label: 'AI & Foundation Models', icon: Bot },
  { id: 'FinTech & Quant', label: 'FinTech & Quant Trading', icon: TrendingUp },
  { id: 'Big Tech & FAANG', label: 'Big Tech & FAANG', icon: Building2 },
  { id: 'Developer Tools', label: 'Developer Platforms', icon: Terminal },
  { id: 'Cloud & Infrastructure', label: 'Cloud & Infrastructure', icon: Globe2 },
  { id: 'Aerospace & Robotics', label: 'Aerospace & Robotics', icon: Cpu },
];

const SEARCH_PRESETS = [
  { label: '🔥 Top Pay ($10k+/mo)', params: { minStipend: '10000', category: 'ALL' } },
  { label: '🤖 Frontier AI Labs', params: { category: 'AI & Machine Learning', minStipend: '' } },
  { label: '📈 Quant Trading', params: { category: 'FinTech & Quant', minStipend: '' } },
  { label: '🌐 100% Remote-First', params: { workPolicy: 'REMOTE_FIRST', category: 'ALL' } },
  { label: '⚡ Actively Hiring Now', params: { hiringOnly: 'true', category: 'ALL' } },
];

const SAVED_COMPANIES_STORAGE_KEY = 'internhub_saved_companies';
const USER_SKILLS_STORAGE_KEY = 'internhub_user_target_skills';

export function CompaniesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const studentProfile = useSelector((state) => state.student?.profile);

  // Layout mode: 'grid' | 'list'
  const [layoutMode, setLayoutMode] = useState('grid');

  // Candidate AI Matching Skills
  const [userSkills, setUserSkills] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_SKILLS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      if (studentProfile?.skills?.length > 0) return studentProfile.skills;
      return ['Python', 'React', 'PyTorch', 'TypeScript'];
    } catch {
      return ['Python', 'React', 'PyTorch', 'TypeScript'];
    }
  });

  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState(false);

  // ─── API-backed company data ───────────────────────────────────────────────
  const [allCompanies, setAllCompanies] = useState(() => getAllEnrichedCompanies());
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);

  // Fetch live company data from MongoDB Atlas on mount
  useEffect(() => {
    let cancelled = false;
    setCompaniesLoading(true);
    getAllEnrichedCompaniesAsync()
      .then((data) => {
        if (!cancelled) {
          setAllCompanies(data);
          setCompaniesError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setCompaniesError(err.message || 'Failed to load companies');
      })
      .finally(() => {
        if (!cancelled) setCompaniesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Saved companies storage
  const [savedCompanyIds, setSavedCompanyIds] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_COMPANIES_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Saved Jobs for Quick Apply / Bookmark within drawers
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const raw = localStorage.getItem('internhub_saved_internships');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Side-by-side comparison tray
  const [comparisonCompanies, setComparisonCompanies] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Quick Preview Slide-over Drawer
  const [previewCompany, setPreviewCompany] = useState(null);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);

  // Quick Apply Modal for roles inside drawers
  const [selectedQuickApplyJob, setSelectedQuickApplyJob] = useState(null);
  const [isQuickApplyModalOpen, setIsQuickApplyModalOpen] = useState(false);

  // Sync skills to storage
  const handleSkillsChange = (newSkills) => {
    setUserSkills(newSkills);
    try {
      localStorage.setItem(USER_SKILLS_STORAGE_KEY, JSON.stringify(newSkills));
    } catch {
      // ignore
    }
    if (newSkills.length > 0) {
      notify.success(`AI Matching updated with ${newSkills.length} target skills.`);
    }
  };

  // URL Query Parameters
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'ALL';
  const selectedSize = searchParams.get('size') || 'ALL';
  const selectedWorkPolicy = searchParams.get('workPolicy') || 'ALL';
  const minStipend = searchParams.get('minStipend') || '';
  const minRating = searchParams.get('minRating') || '';
  const hiringOnly = searchParams.get('hiringOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'most_roles';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Update query params helper
  const updateParams = useCallback(
    (newParams) => {
      const current = Object.fromEntries(searchParams.entries());
      const merged = { ...current, ...newParams };

      // Clean default / empty values
      Object.keys(merged).forEach((key) => {
        if (merged[key] === '' || merged[key] === 'ALL' || merged[key] === null || merged[key] === undefined || (key === 'hiringOnly' && merged[key] === false)) {
          delete merged[key];
        }
      });

      // Reset page to 1 unless page explicitly changed
      if (!('page' in newParams)) {
        delete merged.page;
      }

      setSearchParams(merged);
    },
    [searchParams, setSearchParams]
  );

  // Handlers for filter controls
  const handleSearchChange = (val) => updateParams({ search: val });
  const handleCategoryChange = (val) => updateParams({ category: val });
  const handleSizeChange = (val) => updateParams({ size: val });
  const handleWorkPolicyChange = (val) => updateParams({ workPolicy: val });
  const handleMinStipendChange = (val) => updateParams({ minStipend: val });
  const handleMinRatingChange = (val) => updateParams({ minRating: val });
  const handleHiringOnlyChange = (val) => updateParams({ hiringOnly: val ? 'true' : '' });
  const handleSortByChange = (val) => updateParams({ sortBy: val });
  const handlePageChange = (newPage) => updateParams({ page: newPage });

  const handleResetFilters = () => {
    setSearchParams({});
    notify.info('All filters reset.');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
      (selectedCategory && selectedCategory !== 'ALL') ||
      (selectedSize && selectedSize !== 'ALL') ||
      (selectedWorkPolicy && selectedWorkPolicy !== 'ALL') ||
      minStipend ||
      minRating ||
      hiringOnly ||
      (sortBy && sortBy !== 'most_roles')
  );

  // Compute filtered companies list & pagination (re-runs when allCompanies or filters change)
  const queryResult = useMemo(() => {
    return queryCompanies(
      {
        search: searchQuery,
        category: selectedCategory,
        size: selectedSize,
        workPolicy: selectedWorkPolicy,
        minStipend,
        minRating,
        hiringOnly,
        sortBy,
        page,
        limit: 12,
      },
      userSkills,
      savedCompanyIds,
      allCompanies  // ← pass live API data
    );
  }, [
    allCompanies,
    searchQuery,
    selectedCategory,
    selectedSize,
    selectedWorkPolicy,
    minStipend,
    minRating,
    hiringOnly,
    sortBy,
    page,
    userSkills,
    savedCompanyIds,
  ]);

  // Aggregate Platform KPI statistics (updates after API data loads)
  const platformStats = useMemo(() => getPlatformCompanyStats(allCompanies), [allCompanies]);

  // Spotlight companies (top-rated, updates after API load)
  const spotlightCompanies = useMemo(() => {
    return allCompanies.filter((c) => (c.ratings?.overall || 0) >= 4.85).slice(0, 9);
  }, [allCompanies]);

  // Bookmark / Save Company Toggle
  const handleToggleSaveCompany = (company) => {
    const key = company.slug || company.id;
    const nextSet = new Set(savedCompanyIds);
    if (nextSet.has(key)) {
      nextSet.delete(key);
      notify.info(`Removed ${company.name} from saved employers.`);
    } else {
      nextSet.add(key);
      notify.success(`Saved ${company.name} to your employer radar!`);
    }
    setSavedCompanyIds(nextSet);
    try {
      localStorage.setItem(SAVED_COMPANIES_STORAGE_KEY, JSON.stringify([...nextSet]));
    } catch {
      // ignore
    }
  };

  // Compare Company Toggle
  const handleToggleCompare = (company) => {
    const exists = comparisonCompanies.some((c) => (c.slug || c.id) === (company.slug || company.id));
    if (exists) {
      setComparisonCompanies(comparisonCompanies.filter((c) => (c.slug || c.id) !== (company.slug || company.id)));
      notify.info(`Removed ${company.name} from comparison.`);
    } else {
      if (comparisonCompanies.length >= 4) {
        notify.warning('You can compare up to 4 employers at a time.');
        return;
      }
      setComparisonCompanies([...comparisonCompanies, company]);
      notify.success(`Added ${company.name} to comparison dock.`);
    }
  };

  const handleRemoveCompareCompany = (company) => {
    setComparisonCompanies(comparisonCompanies.filter((c) => (c.slug || c.id) !== (company.slug || company.id)));
  };

  const handleClearAllCompare = () => {
    setComparisonCompanies([]);
  };

  // Quick Preview Drawer open
  const handleOpenQuickPreview = (company) => {
    setPreviewCompany(company);
    setIsPreviewDrawerOpen(true);
  };

  // Quick Apply Trigger inside drawer
  const handleApplyRoleFromDrawer = (role) => {
    setSelectedQuickApplyJob(role);
    setIsQuickApplyModalOpen(true);
  };

  // Toggle Save Job in Drawer
  const handleToggleSaveJobInDrawer = (role) => {
    const roleId = role._id || role.id;
    const nextSet = new Set(savedJobIds);
    if (nextSet.has(roleId)) {
      nextSet.delete(roleId);
      notify.info(`Removed ${role.title} from bookmarks.`);
    } else {
      nextSet.add(roleId);
      notify.success(`Saved ${role.title} to bookmarks!`);
    }
    setSavedJobIds(nextSet);
    try {
      localStorage.setItem('internhub_saved_internships', JSON.stringify([...nextSet]));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title="Top Tech Companies & Frontier AI Labs Hiring Interns | InternHub"
        description="Browse 500+ verified tech companies and AI research labs actively hiring undergraduate and graduate interns. Compare stipends, tech stacks, and culture benchmarks."
        canonicalPath="/companies"
        ogType="website"
        jsonLd={COMPANIES_JSON_LD}
      />

      <Navbar />

      <main id="main-content" className="flex-1 space-y-8 sm:space-y-12 pb-24" aria-label="Company Discovery Platform">
        {/* ── 1. Enterprise Hero & Telemetry Banner ─────────────────────────────────── */}
        <section
          aria-labelledby="companies-hero-heading"
          className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60"
        >
          {/* Ambient Lighting Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-brand-500/8 rounded-full blur-[130px] pointer-events-none -z-0" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span>EMPLOYER INTELLIGENCE & TECH RADAR 2026</span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1
                id="companies-hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
              >
                Discover the world’s most ambitious{' '}
                <span className="text-gradient">engineering teams</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Explore 500+ verified tech employers, frontier AI labs, and high-frequency quant firms.
                Inspect real tech stacks, stipend benchmarks, return offer rates, and interview pipelines.
              </p>
            </div>

            {/* Platform KPI Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-brand-600">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified Employers</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
                  {platformStats.totalCompanies}+
                </span>
                <span className="text-2xs text-emerald-600 font-bold block">100% Identity Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Tier-1 Stipend</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
                  ${(platformStats.avgMonthlyStipend / 1000).toFixed(1)}k<span className="text-sm font-semibold text-slate-500">/mo</span>
                </span>
                <span className="text-2xs text-slate-500 font-medium block">Up to $20k/mo in Quant</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-500">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Return Offer</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
                  {platformStats.avgReturnOfferRate}%
                </span>
                <span className="text-2xs text-slate-500 font-medium block">Intern-to-Fulltime Conversion</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-purple-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Live Roles</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block">
                  {platformStats.activeRolesTotal}+
                </span>
                <span className="text-2xs text-emerald-600 font-bold block">Summer 2026 Cohorts</span>
              </div>
            </div>

            {/* Quick Search Preset Tags */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-2 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Trending Radars:</span>
              {SEARCH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateParams(preset.params)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200/90 shadow-2xs hover:border-brand-300 transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Main Content Container ───────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* AI Smart Match Toggle Button / Radar Widget */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSmartMatchOpen(!isSmartMatchOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>{isSmartMatchOpen ? 'Hide AI Compatibility Radar' : '⚡ Calculate Your AI Match Score (Skill Matcher)'}</span>
              </button>

              {userSkills.length > 0 && (
                <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                  Active Skills: <strong className="text-slate-800">{userSkills.slice(0, 3).join(', ')}</strong> {userSkills.length > 3 ? `+${userSkills.length - 3} more` : ''}
                </span>
              )}
            </div>

            {isSmartMatchOpen && (
              <CompanySmartMatchWidget
                userSkills={userSkills}
                onSkillsChange={handleSkillsChange}
                isActive={isSmartMatchOpen}
                onToggleActive={() => setIsSmartMatchOpen(!isSmartMatchOpen)}
              />
            )}
          </div>

          {/* ── 3. Category Filter Pills Ribbon ─────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_PILLS.map((pill) => {
              const Icon = pill.icon;
              const isSelected = selectedCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleCategoryChange(pill.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-glow-brand border border-brand-500 scale-[1.02]'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── 4. Featured Spotlight Employers Showcase ────────────────────────── */}
          {!hasActiveFilters && page === 1 && (
            <CompanySpotlightBanner
              spotlightCompanies={spotlightCompanies}
              onSelectCompany={handleOpenQuickPreview}
            />
          )}

          {/* ── 5. Multi-faceted Filters & Search Bar ────────────────────────────── */}
          <CompanyFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            selectedWorkPolicy={selectedWorkPolicy}
            onWorkPolicyChange={handleWorkPolicyChange}
            minStipend={minStipend}
            onMinStipendChange={handleMinStipendChange}
            minRating={minRating}
            onMinRatingChange={handleMinRatingChange}
            hiringOnly={hiringOnly}
            onHiringOnlyChange={handleHiringOnlyChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            totalResults={queryResult.total}
          />

          {/* ── 6. Companies Listing (Grid or List View) ────────────────────────── */}
          {queryResult.data.length > 0 ? (
            <div className="space-y-8">
              {layoutMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {queryResult.data.map((company) => (
                    <CompanyCard
                      key={company.slug || company.id}
                      company={company}
                      onQuickPreview={handleOpenQuickPreview}
                      onToggleSave={handleToggleSaveCompany}
                      isSaved={savedCompanyIds.has(company.slug) || savedCompanyIds.has(company.id)}
                      onToggleCompare={handleToggleCompare}
                      isComparing={comparisonCompanies.some(
                        (c) => (c.slug || c.id) === (company.slug || company.id)
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {queryResult.data.map((company) => (
                    <CompanyListRow
                      key={company.slug || company.id}
                      company={company}
                      onQuickPreview={handleOpenQuickPreview}
                      onToggleSave={handleToggleSaveCompany}
                      isSaved={savedCompanyIds.has(company.slug) || savedCompanyIds.has(company.id)}
                      onToggleCompare={handleToggleCompare}
                      isComparing={comparisonCompanies.some(
                        (c) => (c.slug || c.id) === (company.slug || company.id)
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {queryResult.totalPages > 1 && (
                <div className="pt-6 flex justify-center">
                  <Pagination
                    currentPage={queryResult.page}
                    totalPages={queryResult.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-600">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No matching employers found
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We couldn't find any companies matching your current search and filter criteria.
                Try relaxing the compensation tier or clearing specific keywords.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleResetFilters}
                className="mt-2"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* ── Slide-Over Quick Preview Drawer ─────────────────────────────────────── */}
      <CompanyPreviewDrawer
        isOpen={isPreviewDrawerOpen}
        onClose={() => setIsPreviewDrawerOpen(false)}
        company={previewCompany}
        onApplyRole={handleApplyRoleFromDrawer}
        onToggleSaveJob={handleToggleSaveJobInDrawer}
        savedJobIds={savedJobIds}
      />

      {/* ── Floating Comparison Bottom Dock ─────────────────────────────────────── */}
      <CompanyComparisonDock
        selectedCompanies={comparisonCompanies}
        onRemoveCompany={handleRemoveCompareCompany}
        onClearAll={handleClearAllCompare}
        onOpenComparisonModal={() => setIsComparisonModalOpen(true)}
      />

      {/* ── Side-by-Side Comparison Matrix Modal ─────────────────────────────────── */}
      <CompanyComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        companies={comparisonCompanies}
        onRemoveCompany={handleRemoveCompareCompany}
      />

      {/* ── Quick Apply Modal (For 1-Click Role Submissions) ────────────────────── */}
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

export default CompaniesPage;
