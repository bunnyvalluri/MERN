import React, { useState } from 'react';
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
  Bookmark,
  ChevronDown,
  ChevronUp,
  X,
  Code2,
  Cpu,
  GraduationCap,
} from 'lucide-react';

const COMMON_SKILLS = [
  'UI/UX Design',
  'Figma',
  'Design Systems',
  'User Research',
  'PostgreSQL',
  'MongoDB',
  'SQL',
  'Vector DBs',
  'Redis',
  'ClickHouse',
  'AI Agents',
  'LangChain',
  'LLMs',
  'Python',
  'PyTorch',
  'CUDA',
  'React',
  'TypeScript',
  'Node.js',
  'Next.js',
  'Tailwind CSS',
  'Go',
  'Rust',
  'Docker',
  'Kubernetes',
  'AWS',
  'Flutter',
  'React Native',
  'Cypress',
  'Distributed Systems',
  'Cybersecurity',
  'GraphQL',
];

const STIPEND_PRESETS = [
  { label: 'Any', value: '', sub: 'All roles' },
  { label: '$6k+', value: '6000', sub: '$72k/yr' },
  { label: '$8k+', value: '8000', sub: '$96k/yr' },
  { label: '$10k+', value: '10000', sub: '$120k/yr' },
  { label: '$12k+', value: '12000', sub: '$144k/yr' },
  { label: '$15k+', value: '15000', sub: '$180k/yr' },
];

export function InternshipFilters({
  filters,
  onFilterChange,
  onReset,
  onClose,
  savedOnly = false,
  onToggleSavedOnly,
  savedCount = 0,
}) {
  const [skillSearch, setSkillSearch] = useState('');

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

  const filteredSkills = COMMON_SKILLS.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const activeCount = [
    filters.search,
    filters.location,
    filters.remote !== 'ALL' && filters.remote,
    filters.category !== 'ALL' && filters.category,
    filters.type !== 'ALL' && filters.type,
    filters.minStipend,
    filters.skills,
    filters.datePosted !== 'all' && filters.datePosted,
    savedOnly,
  ].filter(Boolean).length;

  return (
    <aside className="w-full space-y-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-2xs">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Stream Filters</h3>
            {activeCount > 0 && (
              <span className="text-[11px] text-brand-600 font-bold">{activeCount} active criteria</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Saved / Bookmarked Only Toggle */}
      {onToggleSavedOnly && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-50/40 to-slate-50 border border-brand-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className={`w-4 h-4 ${savedOnly ? 'fill-brand-600 text-brand-600' : 'text-slate-400'}`} />
            <span className="text-xs font-black text-slate-800">Saved Wishlist</span>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-600 text-white shadow-2xs">
                {savedCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleSavedOnly}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              savedOnly ? 'bg-brand-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                savedOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Keyword Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-brand-600" /> Search Keyword
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. LLM, CUDA, Raft, React..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => handleInputChange('search', '')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Domain / Category Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-brand-600" /> Technical Domain
        </label>
        <select
          value={filters.category || 'ALL'}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
        >
          <option value="ALL">All Technical Domains</option>
          <option value="UI/UX">🎨 UI/UX & Product Design</option>
          <option value="Database">🗄️ Database & Cloud Storage</option>
          <option value="AI Automation">🤖 AI Automation & Agents</option>
          <option value="Data Science">📈 Data Science & Machine Learning</option>
          <option value="Full-Stack">💻 Full-Stack Engineering</option>
          <option value="Frontend">🖥️ Frontend & UI Systems</option>
          <option value="Backend">⚙️ Backend & Distributed Systems</option>
          <option value="Cloud">☁️ DevOps & Cloud Infrastructure</option>
          <option value="Cybersecurity">🛡️ Cybersecurity & Privacy</option>
          <option value="Mobile">📱 Mobile App Engineering (iOS/Android)</option>
          <option value="Product">💼 Product Management</option>
          <option value="QA">✅ QA & Test Automation</option>
          <option value="Web3">⚡ Blockchain & Web3</option>
        </select>
      </div>

      {/* Location Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-600" /> Location / Region
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="San Francisco, New York, Remote..."
            value={filters.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
          />
          {filters.location && (
            <button
              type="button"
              onClick={() => handleInputChange('location', '')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Workplace Type (Remote / Hybrid / On-site) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-brand-600" /> Workplace Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'REMOTE', label: '🌐 Remote' },
            { id: 'HYBRID', label: '🏢 Hybrid' },
            { id: 'ONSITE', label: '📍 In-Office' },
          ].map((item) => {
            const isSelected = (filters.remote || 'ALL') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleInputChange('remote', item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center shadow-2xs cursor-pointer ${
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
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Min Compensation
          </label>
          {filters.minStipend && (
            <span className="text-xs font-mono font-black text-emerald-600">
              ${Number(filters.minStipend).toLocaleString()}/mo
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {STIPEND_PRESETS.map((preset) => {
            const isSelected = (filters.minStipend || '') === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleInputChange('minStipend', preset.value)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span>{preset.label}</span>
                <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {preset.sub}
                </span>
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
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
        >
          <option value="ALL">All Commitments</option>
          <option value="FULL_TIME">Full-Time (Summer 2026 / Co-op)</option>
          <option value="PART_TIME">Part-Time (Academic Year)</option>
        </select>
      </div>

      {/* Date Posted */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Publication Recency
        </label>
        <select
          value={filters.datePosted || 'all'}
          onChange={(e) => handleInputChange('datePosted', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
        >
          <option value="all">Any time (24/7 Live Stream)</option>
          <option value="24h">Past 24 hours</option>
          <option value="7d">Past 7 days</option>
          <option value="14d">Past 14 days</option>
          <option value="30d">Past 30 days</option>
        </select>
      </div>

      {/* Popular Skills Multi-Select with Quick Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-brand-600" /> Core Tech Stack
          </label>
          {selectedSkillsList.length > 0 && (
            <button
              type="button"
              onClick={() => onFilterChange({ skills: '' })}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-bold underline cursor-pointer"
            >
              Clear ({selectedSkillsList.length})
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Filter skills (e.g. CUDA, Python)..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 focus:outline-none"
        />

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredSkills.map((skill) => {
            const isSelected = selectedSkillsList.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl border font-mono transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 border-brand-700 text-white font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1 text-white" />}
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

