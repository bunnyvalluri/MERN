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
  Select,
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
  Zap,
  Bot,
  Laptop,
  Flame,
  Globe2,
  Building,
} from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Opportunities', icon: Sparkles },
  { id: 'LIVE_FEED', label: 'Live 24/7 Feed', icon: Radio, pulse: true },
  { id: 'Artificial Intelligence', label: 'AI & Foundation Models', icon: Bot },
  { id: 'TIER_1', label: 'Tier-1 Tech & FAANG', icon: Building },
  { id: 'Full-Stack Engineering', label: 'Full-Stack Engineering', icon: Laptop },
  { id: 'DevOps & Infrastructure', label: 'Cloud & DevOps', icon: Globe2 },
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
      tags.push({ key: 'search', label: `Search: "${currentFilters.search}"` });
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
      tags.push({ key: 'minStipend', label: `Min $${currentFilters.minStipend}/mo` });
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

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" aria-label="Internship listings">
        
        {/* ── 24/7 Live Radar Ticker & Hero Banner ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 sm:p-7 shadow-lg border border-slate-800">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  LIVE 24/7 FEED ACTIVE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {pagination.total ? `${pagination.total}+ Opportunities Synced` : 'Aggregating live...'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Tech Internships & Roles
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Continuous real-time stream of verified AI research, software engineering, and systems opportunities from 40+ industry leaders and global remote feeds.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleManualLiveSync}
                isLoading={syncing}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md font-semibold text-xs sm:text-sm"
              >
                {syncing ? 'Syncing Feeds...' : 'Sync Live Drops'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Quick Category Pills Bar ────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;
            const isSelected = (currentFilters.category || 'ALL') === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleFilterChange({ category: pill.id })}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-brand-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-slate-400'} ${pill.pulse ? 'animate-pulse text-emerald-500' : ''}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Search & Filter Controls Header ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">
              Showing {internships.length} of {pagination.total || internships.length} opportunities
            </span>
            {lastSyncedAt && (
              <span className="hidden sm:inline text-slate-400 font-mono">
                • Synced {new Date(lastSyncedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Mobile Filter Drawer Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setMobileFilterOpen((p) => !p)}
            >
              Filters {activeFilterTags.length > 0 && `(${activeFilterTags.length})`}
            </Button>

            {/* Layout Toggle (Grid / List) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  layoutMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  layoutMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                List
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                Sort:
              </span>
              <Select
                value={currentFilters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-36 xs:w-44 text-xs sm:text-sm"
                options={[
                  { value: 'latest', label: '⚡ Latest Live Posted' },
                  { value: 'stipend_high', label: '💰 Highest Stipend' },
                  { value: 'deadline', label: '⏳ Deadline Approaching' },
                  { value: 'popularity', label: '🔥 Most Popular' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs animate-fade-in">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {activeFilterTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 font-medium text-xs"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-brand-900 focus:outline-none p-0.5 rounded"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-slate-800 text-xs underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Main Content Grid with Sidebar Filters ─────────────────────────── */}
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
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
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

          {/* Internship Opportunities List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="w-1/3 h-4" />
                        <Skeleton className="w-2/3 h-5" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-12" />
                    <div className="flex gap-2">
                      <Skeleton className="w-16 h-6 rounded-md" />
                      <Skeleton className="w-16 h-6 rounded-md" />
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
                description="Try broadening your keywords, removing some filter constraints, or syncing the live 24/7 feed."
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
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'
                      : 'space-y-3.5'
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
