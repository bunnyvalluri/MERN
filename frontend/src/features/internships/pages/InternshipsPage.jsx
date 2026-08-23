import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInternships,
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
  Briefcase,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
} from 'lucide-react';

export function InternshipsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { internships, pagination, loading, error } = useSelector(
    (state) => state.internships
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter state from URL query parameters
  const currentFilters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      remote: searchParams.get('remote') || 'ALL',
      type: searchParams.get('type') || 'ALL',
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

      // Always reset to page 1 when modifying search/filter parameters (unless page itself was updated)
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
      name: 'Tech Internships on InternHub',
      description: 'Browse verified software, AI/ML, design, and data science internships.',
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
        title="Tech Internships — Browse Verified Roles | InternHub"
        description="Browse and filter 2,000+ verified software engineering, AI/ML, design, and data science internships. Apply directly with your verified student profile."
        canonicalPath="/internships"
        ogType="website"
        jsonLd={internshipsJsonLd}
      />
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" aria-label="Internship listings">
        {/* Page Title & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Explore Internships</span>
              <Sparkles className="w-5 h-5 text-brand-600" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Find and apply to verified software, design, and engineering roles
            </p>
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

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                Sort by:
              </span>
              <Select
                value={currentFilters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-36 xs:w-44 text-xs sm:text-sm"
                options={[
                  { value: 'latest', label: 'Latest Posted' },
                  { value: 'deadline', label: 'Deadline Approaching' },
                  { value: 'stipend_high', label: 'Highest Stipend' },
                  { value: 'stipend_low', label: 'Lowest Stipend' },
                  { value: 'popularity', label: 'Most Popular' },
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 font-medium shadow-sm"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-600 transition-colors p-0.5"
                  aria-label={`Remove ${tag.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 hover:text-slate-900 underline ml-1 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Layout: Sticky Filter Sidebar (Desktop) + Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-24" role="search" aria-label="Filter internships">
            <InternshipFilters
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden p-4 rounded-2xl bg-white border border-slate-200 shadow-modal animate-slide-down">
              <InternshipFilters
                filters={currentFilters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                onClose={() => setMobileFilterOpen(false)}
              />
            </div>
          )}

          {/* Results Grid Container */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Count Bar */}
            <div
              className="flex items-center justify-between text-xs text-slate-500"
              aria-live="polite"
              aria-atomic="true"
            >
              {loading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                <span>
                  Showing{' '}
                  <strong className="text-slate-800">
                    {pagination.total > 0
                      ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}`
                      : '0'}
                  </strong>{' '}
                  of <strong className="text-slate-800">{pagination.total}</strong> open opportunities
                </span>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-5 w-2/3" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : error ? (
              /* Error State */
              <ErrorState
                title="Unable to load opportunities"
                message={error}
                onRetry={() => dispatch(fetchInternships(currentFilters))}
              />
            ) : internships.length === 0 ? (
              /* Empty Results State */
              <EmptyState
                icon={<Search className="w-8 h-8 text-brand-600" />}
                title="No internships match your filters"
                description="Try clearing some search criteria, broadening your location, or resetting the filters to discover more open roles."
                action={
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear All Filters
                  </Button>
                }
              />
            ) : (
              /* Internships Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship._id || internship.id}
                    internship={internship}
                    isSaved={internship.isSaved}
                    onToggleSave={handleToggleSave}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pt-6 border-t border-slate-200 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default InternshipsPage;
