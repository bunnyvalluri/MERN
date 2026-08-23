import React from 'react';
import {
  Filter,
  RotateCcw,
  Search,
  MapPin,
  DollarSign,
  Laptop,
  Briefcase,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'PyTorch',
  'Go',
  'Rust',
  'C++',
  'Java',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'GraphQL',
  'Next.js',
  'Swift',
];

const STIPEND_PRESETS = [
  { label: 'Any Stipend', value: '' },
  { label: '$5k+/mo', value: '5000' },
  { label: '$8k+/mo', value: '8000' },
  { label: '$10k+/mo', value: '10000' },
];

export function InternshipFilters({ filters, onFilterChange, onReset, onClose }) {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills
      ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let newSkills;
    if (currentSkills.includes(skill)) {
      newSkills = currentSkills.filter((s) => s !== skill);
    } else {
      newSkills = [...currentSkills, skill];
    }

    onFilterChange({ skills: newSkills.join(',') });
  };

  const selectedSkillsList = filters.skills
    ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const activeCount = [
    filters.search,
    filters.location,
    filters.remote !== 'ALL' && filters.remote,
    filters.category !== 'ALL' && filters.category,
    filters.type !== 'ALL' && filters.type,
    filters.minStipend,
    filters.skills,
    filters.datePosted !== 'all' && filters.datePosted,
  ].filter(Boolean).length;

  return (
    <aside className="w-full space-y-6 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Filters</h3>
            {activeCount > 0 && (
              <span className="text-[11px] text-brand-600 font-semibold">{activeCount} active</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Keyword Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-brand-600" /> Search Keyword
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. AI, React, Python, Stripe"
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Domain / Category Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-brand-600" /> Domain & Category
        </label>
        <select
          value={filters.category || 'ALL'}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
        >
          <option value="ALL">All Categories & Domains (100+)</option>
          <option value="LIVE_FEED">🟢 Live Synced Feeds (24/7 Drops)</option>
          <option value="TIER_1">🏢 Verified Tier-1 Tech & FAANG</option>
          <option value="Artificial Intelligence">🤖 AI & Foundation Models</option>
          <option value="Full-Stack Engineering">💻 Full-Stack Engineering</option>
          <option value="Frontend Engineering">🎨 Frontend & UI/UX</option>
          <option value="Backend Engineering">⚙️ Backend Systems</option>
          <option value="DevOps & Infrastructure">☁️ Cloud & DevOps</option>
          <option value="Systems Engineering">⚡ Systems & Kernel</option>
          <option value="Security Engineering">🛡️ Cybersecurity</option>
          <option value="Quantitative Trading">📈 Quantitative Trading</option>
        </select>
      </div>

      {/* Location Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-600" /> Location / Region
        </label>
        <input
          type="text"
          placeholder="San Francisco, New York, Remote..."
          value={filters.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
        />
      </div>

      {/* Workplace Type (Remote / Hybrid / On-site) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-brand-600" /> Workplace Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'REMOTE', label: '🌐 Remote Only' },
            { id: 'HYBRID', label: '🏢 Hybrid' },
            { id: 'ONSITE', label: '📍 In-Office' },
          ].map((item) => {
            const isSelected = (filters.remote || 'ALL') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleInputChange('remote', item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Compensation Presets */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Minimum Stipend
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {STIPEND_PRESETS.map((preset) => {
            const isSelected = (filters.minStipend || '') === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleInputChange('minStipend', preset.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Commitment Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-600" /> Commitment
        </label>
        <select
          value={filters.type || 'ALL'}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
        >
          <option value="ALL">All Commitments</option>
          <option value="FULL_TIME">Full-Time (Summer 2026 / Co-op)</option>
          <option value="PART_TIME">Part-Time (Academic Year)</option>
        </select>
      </div>

      {/* Date Posted */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Publication Date
        </label>
        <select
          value={filters.datePosted || 'all'}
          onChange={(e) => handleInputChange('datePosted', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
        >
          <option value="all">Any time (24/7 Live Stream)</option>
          <option value="24h">Past 24 hours</option>
          <option value="7d">Past 7 days</option>
          <option value="14d">Past 14 days</option>
          <option value="30d">Past 30 days</option>
        </select>
      </div>

      {/* Popular Skills Multi-Select */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Tech Stack & Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SKILLS.map((skill) => {
            const isSelected = selectedSkillsList.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl border font-mono transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1 text-brand-600" />}
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default InternshipFilters;
