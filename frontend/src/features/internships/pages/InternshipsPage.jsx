import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInternships,
  toggleSaveInternship,
  clearNewArrivals,
} from '../internshipSlice.js';
import { useSSEStream } from '../../../hooks/useSSEStream.js';
import Navbar from '../../../components/common/Navbar.jsx';
import Footer from '../../../components/common/Footer.jsx';
import SEOHead from '../../../components/common/SEOHead.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import InternshipFilters from '../components/InternshipFilters.jsx';
import InternshipDetailDrawer from '../components/InternshipDetailDrawer.jsx';
import InternshipQuickApplyModal from '../components/InternshipQuickApplyModal.jsx';
import {
  Button,
  Pagination,
  Skeleton,
  EmptyState,
  ErrorState,
  Modal,
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
  Award,
  Cpu,
  Database,
  Code2,
  ChevronDown,
  Info,
  BellRing,
  Palette,
  Smartphone,
  Server,
  Layers,
} from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Opportunities', icon: Sparkles },
  { id: 'UI/UX', label: 'UI/UX & Product Design', icon: Palette },
  { id: 'Database', label: 'Database & Cloud Storage', icon: Database },
  { id: 'AI Automation', label: 'AI Automation & Agents', icon: Bot },
  { id: 'Data Science', label: 'Data Science & Machine Learning', icon: TrendingUp },
  { id: 'Full-Stack', label: 'Full-Stack Engineering', icon: Laptop },
  { id: 'Frontend', label: 'Frontend & UI Systems', icon: Code2 },
  { id: 'Backend', label: 'Backend & Distributed Systems', icon: Cpu },
  { id: 'Cloud', label: 'DevOps & Cloud Infrastructure', icon: Globe2 },
  { id: 'Cybersecurity', label: 'Cybersecurity & InfoSec', icon: ShieldCheck },
  { id: 'Mobile', label: 'Mobile Engineering (iOS / Android)', icon: Smartphone },
  { id: 'Product', label: 'Product Management', icon: Briefcase },
  { id: 'QA', label: 'QA & Test Automation', icon: CheckCircle2 },
  { id: 'Web3', label: 'Blockchain & Web3', icon: Zap },
];

const SEARCH_PRESETS = [
  { label: '🎨 UI/UX & Design', params: { category: 'UI/UX', search: '', minStipend: '' } },
  { label: '🗄️ Database & Storage', params: { category: 'Database', search: '', minStipend: '' } },
  { label: '🤖 AI Automation & Agents', params: { category: 'AI Automation', search: '', minStipend: '' } },
  { label: '🔥 Top Pay ($10k+/mo)', params: { minStipend: '10000', search: '', category: 'ALL' } },
  { label: '🌐 100% Remote Global', params: { remote: 'REMOTE', search: '', category: 'ALL' } },
  { label: '💻 Full-Stack & React', params: { search: 'React', category: 'ALL', minStipend: '' } },
  { label: '⚡ Backend & Systems (Go/Rust)', params: { search: 'Backend', category: 'ALL', minStipend: '' } },
  { label: '📱 Mobile Development', params: { category: 'Mobile', search: '', minStipend: '' } },
  { label: '🛡️ Cybersecurity & AppSec', params: { category: 'Cybersecurity', search: '', minStipend: '' } },
  { label: '⏳ Closing Soon (< 14d)', params: { datePosted: '7d', sortBy: 'deadline' } },
];

function getRelativeTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSecs = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(dateString).toLocaleDateString();
}

export function InternshipsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  const { internships, pagination, loading, lastSyncedAt, error, newArrivalsCount } = useSelector(
    (state) => state.internships
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Hook into live Server-Sent Events (SSE) stream
  const { isConnected: isLiveConnected } = useSSEStream(true);

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
      sortBy: searchParams.get('sortBy') || 'latest',
      datePosted: searchParams.get('datePosted') || 'all',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '12', 10),
    }),
    [searchParams]
  );

  // Synchronize local input state with URL params
  useEffect(() => {
    setHeroSearch(currentFilters.search);
    setHeroLocation(currentFilters.location);
  }, [currentFilters.search, currentFilters.location]);

  // Fetch internships on filter / pagination change
  useEffect(() => {
    dispatch(fetchInternships(currentFilters));
  }, [dispatch, currentFilters]);

  // Handle URL query update
  const updateURLParams = useCallback(
    (newParams) => {
      const updated = new URLSearchParams(searchParams);
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '' || val === 'ALL' || val === 'all') {
          updated.delete(key);
        } else {
          updated.set(key, String(val));
        }
      });
      // Always reset to page 1 on filter changes unless explicitly updating page
      if (!('page' in newParams)) {
        updated.delete('page');
      }
      setSearchParams(updated, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    updateURLParams({ search: heroSearch, location: heroLocation });
  };

  const handlePresetClick = (presetParams) => {
    updateURLParams(presetParams);
  };

  const handleCategorySelect = (catId) => {
    updateURLParams({ category: catId });
  };

  const handleSortChange = (sortBy) => {
    updateURLParams({ sortBy });
  };

  const handlePageChange = (page) => {
    updateURLParams({ page });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleToggleSave = async (internshipId) => {
    if (!isAuthenticated) {
      notify.info('Please log in as a student to save internships.');
      navigate('/login');
      return;
    }
    dispatch(toggleSaveInternship(internshipId));
  };

  const handleViewDetails = (internship) => {
    if (layoutMode === 'split') {
      setSplitSelectedId(internship._id || internship.id);
    } else {
      setSelectedDrawerInternship(internship);
      setDrawerOpen(true);
    }
  };

  const handleQuickApply = (internship) => {
    if (internship.applicationMethod === 'EXTERNAL' && internship.applicationUrl) {
      window.open(internship.applicationUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!isAuthenticated) {
      notify.info('Please sign in as a student to apply directly.');
      navigate('/login');
      return;
    }
    setApplyModalInternship(internship);
    setApplyModalOpen(true);
  };

  const handleRefreshNewArrivals = () => {
    dispatch(clearNewArrivals());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const splitSelectedInternship = useMemo(() => {
    if (!splitSelectedId) return internships[0] || null;
    return internships.find((i) => (i._id || i.id) === splitSelectedId) || internships[0] || null;
  }, [internships, splitSelectedId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <SEOHead
        title="Live Tech Internships & Roles — InternHub Discovery"
        description="Discover verified tech internships and opportunities from top companies and authorized sources. Continuous 24/7 live synchronization."
      />

      <Navbar />

      {/* Real-time SSE Incoming Notification Banner */}
      {newArrivalsCount > 0 && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white shadow-md transition-all animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>
                {newArrivalsCount} new verified opportunity{newArrivalsCount > 1 ? 'ies' : ''} added live.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshNewArrivals}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-brand-700 rounded-lg text-xs font-bold hover:bg-brand-50 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <span>Jump to newest</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearNewArrivals())}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-white via-brand-50/30 to-slate-50 border-b border-slate-200/80 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header & Live Sync Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>{isLiveConnected ? 'Live 24/7 Discovery Stream Active' : 'Verified Opportunities Stream'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Discover Verified Tech Internships
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                Explore thousands of verified roles from top engineering teams and authorized partner feeds.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono self-start md:self-auto bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>Last synchronized: {getRelativeTimeAgo(lastSyncedAt)}</span>
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col md:flex-row items-stretch gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search internships, skills (React, Python, AI), companies..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400"
              />
              {heroSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setHeroSearch('');
                    updateURLParams({ search: '' });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="h-px md:h-auto md:w-px bg-slate-200" />

            <div className="relative flex-1 md:max-w-xs flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                placeholder="Location (e.g. Hyderabad, Remote)"
                className="w-full pl-11 pr-4 py-3 text-sm bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs shrink-0"
            >
              Search Opportunities
            </Button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-mono text-[11px] shrink-0 uppercase tracking-wider font-bold">Quick filters:</span>
            {SEARCH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.params)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-400 hover:text-brand-700 text-slate-700 font-medium whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_PILLS.map((cat) => {
            const Icon = cat.icon;
            const isSelected = currentFilters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              <InternshipFilters
                filters={currentFilters}
                onFilterChange={updateURLParams}
                onReset={() => updateURLParams({})}
                savedOnly={savedOnly}
                onToggleSavedOnly={() => setSavedOnly(!savedOnly)}
              />
            </div>
          </aside>

          {/* Listings Container */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Action Bar: Count, Layout Switches, Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span>Filters</span>
                </button>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    {loading ? (
                      'Searching opportunities...'
                    ) : (
                      `${pagination.total.toLocaleString()} internship${pagination.total === 1 ? '' : 's'} available`
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Showing page {pagination.page} of {pagination.totalPages}
                  </p>
                </div>
              </div>

              {/* Layout Mode & Sort Controls */}
              <div className="flex items-center gap-3">
                {/* Layout Toggles */}
                <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      layoutMode === 'grid' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('list')}
                    aria-label="List view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      layoutMode === 'list' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('split')}
                    aria-label="Split view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      layoutMode === 'split' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Columns3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono hidden md:inline">Sort:</span>
                  <select
                    value={currentFilters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
                  >
                    <option value="latest">Most Recent</option>
                    <option value="deadline">Application Deadline Soon</option>
                    <option value="stipend_high">Highest Compensation</option>
                    <option value="stipend_low">Lowest Compensation</option>
                    <option value="popularity">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <ErrorState
                title="Could not retrieve opportunities"
                message={error}
                onRetry={() => dispatch(fetchInternships(currentFilters))}
              />
            )}

            {/* Loading Skeleton */}
            {loading && !error && (
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="w-1/3 h-4 bg-slate-200 rounded" />
                        <div className="w-1/4 h-3 bg-slate-100 rounded" />
                      </div>
                    </div>
                    <div className="w-3/4 h-5 bg-slate-200 rounded" />
                    <div className="w-full h-12 bg-slate-100 rounded" />
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-slate-200 rounded" />
                      <div className="w-16 h-6 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && internships.length === 0 && (
              <EmptyState
                title="No internships match your filters"
                description="Try clearing some filter criteria, adjusting location or stipend thresholds, or searching for broader skills."
                actionLabel="Reset All Filters"
                onAction={() => updateURLParams({})}
              />
            )}

            {/* Listing Views */}
            {!loading && !error && internships.length > 0 && (
              <>
                {layoutMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {internships.map((internship) => (
                      <InternshipCard
                        key={internship._id || internship.id || internship.slug}
                        internship={internship}
                        layout="grid"
                        onToggleSave={handleToggleSave}
                        onViewDetails={handleViewDetails}
                        onQuickApply={handleQuickApply}
                      />
                    ))}
                  </div>
                )}

                {layoutMode === 'list' && (
                  <div className="space-y-4">
                    {internships.map((internship) => (
                      <InternshipCard
                        key={internship._id || internship.id || internship.slug}
                        internship={internship}
                        layout="list"
                        onToggleSave={handleToggleSave}
                        onViewDetails={handleViewDetails}
                        onQuickApply={handleQuickApply}
                      />
                    ))}
                  </div>
                )}

                {layoutMode === 'split' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Feed */}
                    <div className="lg:col-span-5 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
                      {internships.map((internship) => {
                        const id = internship._id || internship.id;
                        const isSelected = (splitSelectedInternship?._id || splitSelectedInternship?.id) === id;
                        return (
                          <InternshipCard
                            key={id}
                            internship={internship}
                            layout="split"
                            isSelected={isSelected}
                            onToggleSave={handleToggleSave}
                            onViewDetails={handleViewDetails}
                            onQuickApply={handleQuickApply}
                          />
                        );
                      })}
                    </div>

                    {/* Right Column: Active Preview */}
                    <div className="lg:col-span-7 sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                      {splitSelectedInternship && (
                        <>
                          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-bold text-brand-600 block">
                                {splitSelectedInternship.companyName}
                              </span>
                              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                                {splitSelectedInternship.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono mt-1">
                                {splitSelectedInternship.category} • {splitSelectedInternship.workMode} • Source: {splitSelectedInternship.source}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleSave(splitSelectedInternship._id || splitSelectedInternship.id)}
                              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Role Description</h4>
                            <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-line">
                              {splitSelectedInternship.description}
                            </div>

                            {splitSelectedInternship.skills?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {splitSelectedInternship.skills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-medium text-slate-700"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <Button
                              onClick={() => handleQuickApply(splitSelectedInternship)}
                              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl"
                            >
                              {splitSelectedInternship.applicationMethod === 'EXTERNAL' ? 'Apply on Source' : 'Quick Apply'}
                            </Button>

                            <Link
                              to={`/internships/${splitSelectedInternship.slug || splitSelectedInternship._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                            >
                              <span>Open Full Page</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Pagination Bar */}
                {pagination.totalPages > 1 && (
                  <div className="pt-8 flex justify-center">
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

      {/* Slide-out Internship Detail Drawer */}
      <InternshipDetailDrawer
        internship={selectedDrawerInternship}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToggleSave={handleToggleSave}
        onApplyClick={handleQuickApply}
        onQuickApply={handleQuickApply}
      />

      {/* Quick Apply Modal */}
      <InternshipQuickApplyModal
        internship={applyModalInternship}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />

      {/* Mobile Filter Sheet / Modal */}
      <Modal
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Opportunities"
      >
        <div className="py-2">
          <InternshipFilters
            filters={currentFilters}
            onFilterChange={(newFilters) => {
              updateURLParams(newFilters);
              setMobileFilterOpen(false);
            }}
            onReset={() => {
              updateURLParams({});
              setMobileFilterOpen(false);
            }}
            savedOnly={savedOnly}
            onToggleSavedOnly={() => setSavedOnly(!savedOnly)}
          />
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

export default InternshipsPage;
