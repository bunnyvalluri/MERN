import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInternships,
  syncLiveFeeds,
  toggleSaveInternship,
} from '../internshipSlice.js';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import InternshipFilters from '../components/InternshipFilters.jsx';
import {
  Button,
  Pagination,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  Radio,
  Bot,
  Laptop,
  Flame,
  Globe2,
  Building,
  Search,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap,
  LayoutGrid,
  List,
} from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Opportunities', icon: Sparkles },
  { id: 'LIVE_FEED', label: 'Live 24/7 Feed', icon: Radio, pulse: true },
  { id: 'Artificial Intelligence', label: 'AI & Foundation Models', icon: Bot },
  { id: 'TIER_1', label: 'Tier-1 Tech & FAANG', icon: Building },
  { id: 'Full-Stack Engineering', label: 'Full-Stack Engineering', icon: Laptop },
  { id: 'DevOps & Infrastructure', label: 'Cloud & Infrastructure', icon: Globe2 },
  { id: 'Security Engineering', label: 'Cybersecurity', icon: ShieldCheck },
  { id: 'Quantitative Trading', label: 'Quantitative Trading', icon: TrendingUp },
];

export function InternshipsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { internships, pagination, loading, syncing, lastSyncedAt, error } = useSelector(
    (state) => state.internships
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('');

  // Extract filter state from URL query parameters
  const currentFilters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      remote: searchParams.get('remote') || 'ALL',
      type: searchParams.get('type') || 'ALL',
      category: searchParams.get('category') || 'ALL',
      skills: searchParams.get('skills') || '',
      minStipend: searchParams.get('minStipend') || '',
      maxStipend: searchParams.get('maxStipend') || '',
      datePosted: searchParams.get('datePosted') || 'all',
      sortBy: searchParams.get('sortBy') || 'latest',
      page: parseInt(searchParams.get('page'), 10) || 1,
      limit: 12,
    }),
    [searchParams]
  );

  // Synchronize hero inputs with URL
  useEffect(() => {
    setHeroSearch(currentFilters.search);
    setHeroLocation(currentFilters.location);
  }, [currentFilters.search, currentFilters.location]);

  // Fetch internships whenever URL params change
  useEffect(() => {
    const params = {};
    searchParams.forEach((val, key) => {
      if (val && val !== 'ALL' && val !== 'all') {
        params[key] = val;
      }
    });
    if (!params.page) params.page = currentFilters.page;
    if (!params.limit) params.limit = currentFilters.limit;

    dispatch(fetchInternships(params));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, searchParams, currentFilters.page, currentFilters.limit]);

  // Automated 24/7 background sync polling every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const params = {};
      searchParams.forEach((val, key) => {
        if (val && val !== 'ALL' && val !== 'all') {
          params[key] = val;
        }
      });
      dispatch(fetchInternships(params));
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, searchParams]);

  // Update URL query parameters on filter change
  const handleFilterChange = useCallback(
    (newFilterValues) => {
      const nextParams = new URLSearchParams(searchParams);

      Object.entries(newFilterValues).forEach(([key, val]) => {
        if (val === '' || val === 'ALL' || val === 'all' || val === undefined) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, val);
        }
      });

      if (!newFilterValues.page) {
        nextParams.set('page', '1');
      }

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleHeroSearchSubmit = (e) => {
    e?.preventDefault();
    handleFilterChange({
      search: heroSearch,
      location: heroLocation,
      page: '1',
    });
  };

  const handleResetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const handlePageChange = useCallback(
    (newPage) => {
      handleFilterChange({ page: newPage.toString() });
    },
    [handleFilterChange]
  );

  const handleManualLiveSync = async () => {
    const params = {};
    searchParams.forEach((val, key) => {
      if (val && val !== 'ALL' && val !== 'all') {
        params[key] = val;
      }
    });
    const res = await dispatch(syncLiveFeeds(params));
    if (syncLiveFeeds.fulfilled.match(res)) {
      notify.success('✨ Live 24/7 radar refreshed! Synced latest global opportunities.');
    }
  };

  const handleToggleSave = async (internshipId) => {
    if (!isAuthenticated) {
      notify.info('Please sign in to save internships to your bookmarks.');
      navigate('/login');
      return;
    }
    const result = await dispatch(toggleSaveInternship(internshipId));
    if (toggleSaveInternship.fulfilled.match(result)) {
      notify.success(
        result.payload.isSaved
          ? 'Saved to your bookmarks!'
          : 'Removed from bookmarks.'
      );
    }
  };

  const handleViewDetails = (item) => {
    const id = item._id || item.id || item.slug;
    navigate(`/internships/${id}`);
  };

  // Compute active filters list for display tags
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (currentFilters.search) {
      tags.push({ key: 'search', label: `Keyword: "${currentFilters.search}"` });
    }
    if (currentFilters.category && currentFilters.category !== 'ALL') {
      tags.push({ key: 'category', label: `Domain: ${currentFilters.category}` });
    }
    if (currentFilters.location) {
      tags.push({ key: 'location', label: `Location: ${currentFilters.location}` });
    }
    if (currentFilters.remote && currentFilters.remote !== 'ALL') {
      tags.push({
        key: 'remote',
        label: currentFilters.remote === 'REMOTE' ? 'Remote Only' : currentFilters.remote,
      });
    }
    if (currentFilters.type && currentFilters.type !== 'ALL') {
      tags.push({
        key: 'type',
        label: currentFilters.type === 'FULL_TIME' ? 'Full-Time' : 'Part-Time',
      });
    }
    if (currentFilters.minStipend) {
      tags.push({ key: 'minStipend', label: `Min $${Number(currentFilters.minStipend).toLocaleString()}/mo` });
    }
    if (currentFilters.skills) {
      currentFilters.skills.split(',').forEach((skill) => {
        tags.push({ key: `skill_${skill}`, skillName: skill, label: skill });
      });
    }
    if (currentFilters.datePosted && currentFilters.datePosted !== 'all') {
      tags.push({ key: 'datePosted', label: `Posted: ${currentFilters.datePosted}` });
    }
    return tags;
  }, [currentFilters]);

  const removeTag = (tag) => {
    if (tag.skillName) {
      const remaining = currentFilters.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== tag.skillName)
        .join(',');
      handleFilterChange({ skills: remaining });
    } else {
      handleFilterChange({ [tag.key]: '' });
    }
  };

  /** Build ItemList JSON-LD from first page of results */
  const internshipsJsonLd = useMemo(() => {
    if (!internships.length) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '24/7 Tech Internships on InternHub',
      description: 'Live real-time feed of software, AI/ML, systems, and design internships.',
      url: 'https://internhub.dev/internships',
      numberOfItems: pagination.total || internships.length,
      itemListElement: internships.slice(0, 10).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.title,
        url: `https://internhub.dev/internships/${item._id || item.id}`,
      })),
    };
  }, [internships, pagination.total]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-brand-500/20 selection:text-brand-700">
      <SEOHead
        title="Live 24/7 Tech Internships — Explore Verified Roles | InternHub"
        description="Real-time 24/7 live feed of software engineering, AI/ML, cloud, systems, and design internships from top global tech companies and startups."
        canonicalPath="/internships"
        ogType="website"
        jsonLd={internshipsJsonLd}
      />
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7" aria-label="Internship listings">
        
        {/* ── Masterclass Command Center Hero Banner ────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-9 shadow-2xl border border-slate-800/80">
          {/* Subtle Ambient Glow Effects */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Bar: Live Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  LIVE 24/7 RADAR STREAM
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  Auto-sync active (every 60s)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualLiveSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing Live Drops...' : 'Sync Live Feeds'}</span>
                </button>
              </div>
            </div>

            {/* Headline */}
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Discover Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">Tech Internships</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
                Real-time aggregated roles in AI/ML research, full-stack web, distributed systems, and design from 40+ industry leaders and continuous 24/7 global feeds.
              </p>
            </div>

            {/* Integrated Hero Search Console */}
            <form onSubmit={handleHeroSearchSubmit} className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex flex-col md:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2 w-full md:flex-1">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Role, tech stack, or company (e.g. OpenAI, React, PyTorch)"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              <div className="hidden md:block w-px h-7 bg-slate-200" />

              <div className="flex items-center gap-2.5 px-3.5 py-2 w-full md:w-64">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Location or 'Remote'"
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-900 hover:bg-brand-600 text-white transition-all shadow-md shrink-0"
              >
                Search Roles
              </button>
            </form>

            {/* Live Metrics Ticker Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Total Synced Roles</span>
                <p className="font-extrabold text-white text-sm sm:text-base font-mono">
                  {pagination.total ? `${pagination.total}+ Live` : '100+ Live'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Avg Compensation</span>
                <p className="font-extrabold text-emerald-400 text-sm sm:text-base font-mono">$8,850 / mo</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Top Employers</span>
                <p className="font-extrabold text-white text-sm sm:text-base">40+ Tier-1 Labs</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Application Speed</span>
                <p className="font-extrabold text-brand-300 text-sm sm:text-base font-mono">1-Click Fast-Track</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Filter Ribbon ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;
            const isSelected = (currentFilters.category || 'ALL') === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleFilterChange({ category: pill.id })}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-slate-400'} ${pill.pulse ? 'animate-pulse text-emerald-500' : ''}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Results Toolbar (Count, Layout Switcher, Sort) ──────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-extrabold text-slate-900 text-sm">
              {internships.length} of {pagination.total || internships.length} Opportunities Available
            </span>
            {lastSyncedAt && (
              <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
                • Updated {new Date(lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-xs"
              onClick={() => setMobileFilterOpen((p) => !p)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters {activeFilterTags.length > 0 && `(${activeFilterTags.length})`}</span>
            </button>

            {/* Layout Toggle (Grid / List) */}
            <div className="hidden sm:flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'grid' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid layout view"
                aria-label="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'list' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List layout view"
                aria-label="List layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={currentFilters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white shadow-2xs focus:border-brand-500 focus:outline-none"
              >
                <option value="latest">⚡ Latest Live Posted</option>
                <option value="stipend_high">💰 Highest Stipend</option>
                <option value="deadline">⏳ Deadline Approaching</option>
                <option value="popularity">🔥 Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Active Filter Badges ────────────────────────────────────────────── */}
        {activeFilterTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs animate-fade-in">
            <span className="text-slate-500 font-medium">Filtered by:</span>
            {activeFilterTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-semibold text-xs shadow-2xs"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-brand-900 focus:outline-none p-0.5 rounded text-xs"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Main Layout: Sticky Sidebar + Opportunities Stream ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <InternshipFilters
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-4 overflow-y-auto z-10 animate-slide-in-right">
                <InternshipFilters
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  onClose={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Opportunities Stream */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-13 h-13 rounded-2xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="w-1/3 h-4 rounded-md" />
                        <Skeleton className="w-3/4 h-5 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-10 rounded-xl" />
                    <div className="flex gap-2">
                      <Skeleton className="w-20 h-7 rounded-lg" />
                      <Skeleton className="w-20 h-7 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title="Unable to load live opportunities"
                message={error}
                onRetry={handleManualLiveSync}
              />
            ) : internships.length === 0 ? (
              <EmptyState
                title="No opportunities found matching your criteria"
                description="Try broadening your search keywords, clearing your filter criteria, or syncing the live 24/7 global feed."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset all filters
                  </Button>
                }
              />
            ) : (
              <>
                <div
                  className={
                    layoutMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
                      : 'space-y-4'
                  }
                >
                  {internships.map((internship) => (
                    <InternshipCard
                      key={internship._id || internship.id || internship.slug}
                      internship={internship}
                      layout={layoutMode}
                      isSaved={internship.isSaved}
                      onToggleSave={handleToggleSave}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-8 border-t border-slate-200">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default InternshipsPage;
