import React from 'react';
import {
  COMPANY_CATEGORY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  WORK_POLICY_OPTIONS,
} from '../data/companiesData.js';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  DollarSign,
  Star,
  Building2,
  LayoutGrid,
  List,
  CheckCircle2,
} from 'lucide-react';

export function CompanyFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  selectedWorkPolicy,
  onWorkPolicyChange,
  minStipend,
  onMinStipendChange,
  minRating,
  onMinRatingChange,
  hiringOnly,
  onHiringOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
  layoutMode,
  onLayoutModeChange,
  totalResults = 0,
}) {
  return (
    <div className="space-y-4">
      {/* Top Search Bar, Fast Sorters & Layout Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input with quick clear */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search companies by name, tech stack (PyTorch, React, Rust), HQ, or roles..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorter Dropdown & Layout Mode Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
              >
                <option value="most_roles">🔥 Most Open Roles</option>
                <option value="stipend_high">💰 Highest Stipend ($/mo)</option>
                <option value="rating_high">⭐ Intern Rating (Highest)</option>
                <option value="ai_match">🤖 AI Compatibility Score</option>
                <option value="ai_innovation">⚡ AI Innovation Index</option>
                <option value="name_asc">🔤 Company Name (A–Z)</option>
              </select>
            </div>

            {/* Layout Switcher (Grid vs List) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onLayoutModeChange('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  layoutMode === 'grid'
                    ? 'bg-white text-brand-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  layoutMode === 'list'
                    ? 'bg-white text-brand-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List / Table view"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Faceted Filter Options Grid */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Industry Category Dropdown */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 uppercase tracking-wider text-2xs block">
              Industry / Sector
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {COMPANY_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Company Size */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 uppercase tracking-wider text-2xs block">
              Company Size
            </label>
            <select
              value={selectedSize}
              onChange={(e) => onSizeChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {COMPANY_SIZE_OPTIONS.map((sz) => (
                <option key={sz.id} value={sz.id}>
                  {sz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Work Culture Policy */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 uppercase tracking-wider text-2xs block">
              Work Culture
            </label>
            <select
              value={selectedWorkPolicy}
              onChange={(e) => onWorkPolicyChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              {WORK_POLICY_OPTIONS.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Monthly Stipend */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 uppercase tracking-wider text-2xs block">
              Minimum Stipend
            </label>
            <select
              value={minStipend}
              onChange={(e) => onMinStipendChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="">Any Compensation</option>
              <option value="6000">$6,000+ / month</option>
              <option value="8000">$8,000+ / month</option>
              <option value="10000">🔥 $10,000+ / month (Top 5%)</option>
              <option value="13000">💎 $13,000+ / month (Elite Tier-1)</option>
            </select>
          </div>
        </div>

        {/* Quick Active Toggles Bar & Active Filters Reset */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Actively Hiring Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={hiringOnly}
                onChange={(e) => onHiringOnlyChange(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 transition"
              />
              <span>🔥 Only show companies with active open roles</span>
            </label>

            {/* Min 4.5+ Rating Toggle */}
            <button
              type="button"
              onClick={() => onMinRatingChange(minRating === '4.8' ? '' : '4.8')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                minRating === '4.8'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Top Rated (4.8+ Stars)</span>
            </button>
          </div>

          {/* Results Count & Reset Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{totalResults}</strong> companies
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors border border-rose-200/80"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyFilters;
