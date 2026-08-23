import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import InternshipDetailDrawer from '../components/InternshipDetailDrawer.jsx';
import InternshipQuickApplyModal from '../components/InternshipQuickApplyModal.jsx';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
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
  Columns3,
  X,
  Clock,
  DollarSign,
  Send,
  ExternalLink,
  ArrowUpRight,
  Bookmark,
  Share2,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Target,
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

const SEARCH_PRESETS = [
  { label: '🔥 Top Pay ($10k+/mo)', params: { minStipend: '10000', search: '', category: 'ALL' } },
  { label: '🤖 AI Research & LLMs', params: { category: 'Artificial Intelligence', search: '', minStipend: '' } },
  { label: '🌐 100% Remote Global', params: { remote: 'REMOTE', search: '', category: 'ALL' } },
  { label: '🏢 Tier-1 & FAANG', params: { category: 'TIER_1', search: '', minStipend: '' } },
  { label: '⚡ Closing in < 7 Days', params: { datePosted: '7d', sortBy: 'deadline' } },
];

export function InternshipsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const { internships, pagination, loading, syncing, lastSyncedAt, error } = useSelector(
    (state) => state.internships
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list' | 'split'
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  // Drawer Preview state
  const [selectedDrawerInternship, setSelectedDrawerInternship] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Split View selected internship
  const [splitSelectedId, setSplitSelectedId] = useState(null);

  // Quick Apply Modal state
  const [applyModalInternship, setApplyModalInternship] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

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

  // Global Keyboard Shortcut: '/' to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  // Default select first item in split mode if none selected
  useEffect(() => {
    if (layoutMode === 'split' && internships.length > 0) {
      if (!splitSelectedId || !internships.some((i) => (i._id || i.id || i.slug) === splitSelectedId)) {
        setSplitSelectedId(internships[0]._id || internships[0].id || internships[0].slug);
      }
    }
  }, [layoutMode, internships, splitSelectedId]);

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
    setSavedOnly(false);
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

  // Open Drawer or Navigate
  const handleOpenDetail = (item) => {
    setSelectedDrawerInternship(item);
    setDrawerOpen(true);
  };

  // Open Quick Apply Modal
  const handleOpenQuickApply = (item) => {
    setApplyModalInternship(item);
    setApplyModalOpen(true);
  };

  // Drawer Next/Prev Navigation
  const drawerIndex = useMemo(() => {
    if (!selectedDrawerInternship) return -1;
    return internships.findIndex(
      (i) => (i._id || i.id || i.slug) === (selectedDrawerInternship._id || selectedDrawerInternship.id || selectedDrawerInternship.slug)
    );
  }, [internships, selectedDrawerInternship]);

  const hasPrevDrawer = drawerIndex > 0;
  const hasNextDrawer = drawerIndex >= 0 && drawerIndex < internships.length - 1;

  const handlePrevDrawer = () => {
    if (hasPrevDrawer) {
      setSelectedDrawerInternship(internships[drawerIndex - 1]);
    }
  };

  const handleNextDrawer = () => {
    if (hasNextDrawer) {
      setSelectedDrawerInternship(internships[drawerIndex + 1]);
    }
  };

  // Filter for Saved Wishlist Only
  const displayedInternships = useMemo(() => {
    if (!savedOnly) return internships;
    return internships.filter((item) => item.isSaved);
  }, [internships, savedOnly]);

  const savedCount = useMemo(() => {
    return internships.filter((item) => item.isSaved).length;
  }, [internships]);

  // Selected item for split view
  const currentSplitInternship = useMemo(() => {
    if (!splitSelectedId) return internships[0] || null;
    return internships.find((i) => (i._id || i.id || i.slug) === splitSelectedId) || internships[0] || null;
  }, [internships, splitSelectedId]);

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
    if (savedOnly) {
      tags.push({ key: 'savedOnly', label: 'Saved Wishlist Only' });
    }
    return tags;
  }, [currentFilters, savedOnly]);

  const removeTag = (tag) => {
    if (tag.key === 'savedOnly') {
      setSavedOnly(false);
    } else if (tag.skillName) {
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

  /** Build ItemList JSON-LD from results */
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

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-7" aria-label="Internship listings">
        
        {/* ── Modern Clean Light Hero Banner (Fully Responsive) ─────── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 lg:p-8 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Live 24/7 Radar Active
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • {pagination.total ? `${pagination.total}+ Opportunities Synced` : '140+ Opportunities Synced'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualLiveSync}
                disabled={syncing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Live Drops'}</span>
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-1.5 sm:space-y-2">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Explore Verified <span className="text-brand-600">Tech Internships</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Real-time verified opportunities in AI/ML research, software engineering, systems, and product design from 40+ industry leaders and continuous 24/7 global streams.
            </p>
          </div>

          {/* Clean Integrated Search Console with Responsive Stack */}
          <form onSubmit={handleHeroSearchSubmit} className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 w-full md:flex-1 bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-slate-200 relative">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Role, tech stack, or company (e.g. Stripe, PyTorch)"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none pr-6"
              />
              {heroSearch && (
                <button
                  type="button"
                  onClick={() => setHeroSearch('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="hidden md:block w-px h-6 bg-slate-200" />

            <div className="flex items-center gap-2 px-3 py-2 w-full md:w-60 bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-0 border-slate-200 relative">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. Remote, SF)"
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none pr-6"
              />
              {heroLocation && (
                <button
                  type="button"
                  onClick={() => setHeroLocation('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Preset Filters */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Trending:</span>
            {SEARCH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleFilterChange(preset.params)}
                className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100/90 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200/70 transition-colors shadow-2xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Filter Ribbon ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar touch-scroll -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;
            const isSelected = (currentFilters.category || 'ALL') === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleFilterChange({ category: pill.id })}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all duration-150 shadow-2xs shrink-0 ${
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

        {/* ── Results Toolbar (Count, Layout Switchers, Sort, Mobile Filter) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {displayedInternships.length} of {pagination.total || displayedInternships.length} Opportunities
            </span>
            {lastSyncedAt && (
              <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
                • Synced {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 flex-wrap">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 shadow-xs"
              onClick={() => setMobileFilterOpen((p) => !p)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters {activeFilterTags.length > 0 && `(${activeFilterTags.length})`}</span>
            </button>

            {/* Layout Toggle (Grid / List / Split Master-Detail on larger screens) */}
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
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                className={`hidden lg:block p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'split' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Split Master-Detail View"
                aria-label="Split layout"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={currentFilters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white shadow-2xs focus:border-brand-500 focus:outline-none"
              >
                <option value="latest">⚡ Latest Live</option>
                <option value="stipend_high">💰 Highest Pay</option>
                <option value="deadline">⏳ Deadline</option>
                <option value="popularity">🔥 Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Active Filter Badges ────────────────────────────────────────────── */}
        {activeFilterTags.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs animate-fade-in">
            <span className="text-slate-500 font-medium text-[11px] sm:text-xs">Active:</span>
            {activeFilterTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-semibold text-[11px] sm:text-xs shadow-2xs"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <InternshipFilters
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              savedOnly={savedOnly}
              onToggleSavedOnly={() => setSavedOnly((p) => !p)}
              savedCount={savedCount}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-4 overflow-y-auto z-10 animate-slide-in-right touch-scroll">
                <InternshipFilters
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  onClose={() => setMobileFilterOpen(false)}
                  savedOnly={savedOnly}
                  onToggleSavedOnly={() => setSavedOnly((p) => !p)}
                  savedCount={savedCount}
                />
              </div>
            </div>
          )}

          {/* Opportunities Stream / Split View */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
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
            ) : displayedInternships.length === 0 ? (
              <EmptyState
                title="No opportunities found matching your criteria"
                description="Try broadening your search keywords, clearing your filter criteria, or syncing the live 24/7 global feed."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset all filters
                  </Button>
                }
              />
            ) : layoutMode === 'split' ? (
              /* ── Split Master-Detail View (Desktop only) ─────────────────── */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left Stream Column */}
                <div className="md:col-span-5 space-y-3 max-h-[85vh] overflow-y-auto pr-1 touch-scroll">
                  {displayedInternships.map((internship) => {
                    const itemId = internship._id || internship.id || internship.slug;
                    return (
                      <InternshipCard
                        key={itemId}
                        internship={internship}
                        layout="split"
                        isSelected={splitSelectedId === itemId}
                        isSaved={internship.isSaved}
                        onToggleSave={handleToggleSave}
                        onViewDetails={() => setSplitSelectedId(itemId)}
                      />
                    );
                  })}
                </div>

                {/* Right Sticky Preview Pane */}
                <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5 sticky top-24 max-h-[85vh] overflow-y-auto touch-scroll">
                  {currentSplitInternship ? (
                    <>
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <CompanyLogo
                            companyName={currentSplitInternship.companyId?.name || currentSplitInternship.company}
                            slug={currentSplitInternship.companyId?.slug || currentSplitInternship.companySlug}
                            logo={currentSplitInternship.companyId?.logo || currentSplitInternship.companyLogo}
                            website={currentSplitInternship.companyId?.website || currentSplitInternship.companyWebsite}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {currentSplitInternship.companyId?.name || currentSplitInternship.company}
                              </span>
                              {currentSplitInternship.companyId?.verified !== false && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                              )}
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight line-clamp-1">
                              {currentSplitInternship.title}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                              {typeof currentSplitInternship.location === 'object'
                                ? currentSplitInternship.location?.city
                                : currentSplitInternship.location || 'Remote'} • {currentSplitInternship.remote || 'Remote'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSave(currentSplitInternship._id || currentSplitInternship.id || currentSplitInternship.slug)}
                            className={`p-2 rounded-xl border transition-all ${
                              currentSplitInternship.isSaved
                                ? 'bg-brand-50 border-brand-200 text-brand-600'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${currentSplitInternship.isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Stipend Banner */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Monthly Compensation</span>
                          <span className="text-lg sm:text-xl font-black text-emerald-600 font-mono">
                            {typeof currentSplitInternship.stipend === 'object' && currentSplitInternship.stipend?.amount
                              ? `$${currentSplitInternship.stipend.amount.toLocaleString()}/mo`
                              : currentSplitInternship.stipend || '$8,500/mo'}
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenQuickApply(currentSplitInternship)}
                          className="font-bold shadow-xs text-xs"
                        >
                          1-Click Apply
                        </Button>
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">About Role</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {currentSplitInternship.description ||
                            'Join leading engineering teams to build resilient high-impact systems with world-class mentorship.'}
                        </p>
                      </div>

                      {/* Skills */}
                      {Array.isArray(currentSplitInternship.skills) && currentSplitInternship.skills.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Tech Stack</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {currentSplitInternship.skills.map((s) => (
                              <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDrawerInternship(currentSplitInternship);
                            setDrawerOpen(true);
                          }}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          <span>Open Full Slide-Over</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/internships/${currentSplitInternship._id || currentSplitInternship.id || currentSplitInternship.slug}`)}
                          className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                        >
                          View page →
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              /* ── Grid or List View ─────────────────────────────────────── */
              <>
                <div
                  className={
                    layoutMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5'
                      : 'space-y-3.5 sm:space-y-4'
                  }
                >
                  {displayedInternships.map((internship) => (
                    <InternshipCard
                      key={internship._id || internship.id || internship.slug}
                      internship={internship}
                      layout={layoutMode}
                      isSaved={internship.isSaved}
                      onToggleSave={handleToggleSave}
                      onViewDetails={handleOpenDetail}
                      onQuickApply={handleOpenQuickApply}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-6 sm:pt-8 border-t border-slate-200">
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

      {/* ── Slide-Over Detail Drawer ───────────────────────────────────────── */}
      <InternshipDetailDrawer
        internship={selectedDrawerInternship}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApplyClick={(item) => {
          setDrawerOpen(false);
          handleOpenQuickApply(item);
        }}
        onToggleSave={handleToggleSave}
        isSaved={Boolean(selectedDrawerInternship?.isSaved)}
        onNavigatePrev={handlePrevDrawer}
        onNavigateNext={handleNextDrawer}
        hasPrev={hasPrevDrawer}
        hasNext={hasNextDrawer}
      />

      {/* ── 1-Click Instant Apply Modal ────────────────────────────────────── */}
      <InternshipQuickApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        internship={applyModalInternship}
        onAppliedSuccessfully={() => {
          // Refresh if needed
        }}
      />

      <Footer />
    </div>
  );
}

export default InternshipsPage;
