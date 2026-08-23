import React from 'react';
import {
  Input,
  Button,
  Select,
} from '../../../components/ui/index.js';
import {
  Filter,
  RotateCcw,
  Search,
  MapPin,
  DollarSign,
  Laptop,
} from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'Go',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
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

  return (
    <aside className="w-full space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Filter Opportunities</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onReset}
            className="text-slate-500 hover:text-slate-900"
          >
            Reset
          </Button>
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
        <label className="text-xs font-semibold text-slate-700">Keyword / Role</label>
        <Input
          placeholder="e.g. Software Engineer, React"
          leftIcon={<Search className="w-4 h-4" />}
          value={filters.search || ''}
          onChange={(e) => handleInputChange('search', e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Location</label>
        <Input
          placeholder="City, state, or country"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={filters.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
      </div>

      {/* Workplace Type (Remote/Hybrid/Onsite) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Laptop className="w-3.5 h-3.5 text-brand-600" />
          Workplace Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'REMOTE', label: 'Remote Only' },
            { id: 'HYBRID', label: 'Hybrid' },
            { id: 'ONSITE', label: 'On-site' },
          ].map((item) => {
            const isSelected = (filters.remote || 'ALL') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleInputChange('remote', item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-center shadow-sm ${
                  isSelected
                    ? 'bg-brand-600 border-brand-600 text-white font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Commitment</label>
        <Select
          value={filters.type || 'ALL'}
          onChange={(e) => handleInputChange('type', e.target.value)}
          options={[
            { value: 'ALL', label: 'All Commitments' },
            { value: 'FULL_TIME', label: 'Full-Time Internship' },
            { value: 'PART_TIME', label: 'Part-Time Internship' },
          ]}
        />
      </div>

      {/* Minimum Monthly Stipend */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Minimum Monthly Stipend ($)</label>
        <Input
          type="number"
          placeholder="e.g. 1000"
          leftIcon={<DollarSign className="w-4 h-4" />}
          value={filters.minStipend || ''}
          onChange={(e) => handleInputChange('minStipend', e.target.value)}
          min={0}
        />
      </div>

      {/* Date Posted */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Date Posted</label>
        <Select
          value={filters.datePosted || 'all'}
          onChange={(e) => handleInputChange('datePosted', e.target.value)}
          options={[
            { value: 'all', label: 'Any time' },
            { value: 'today', label: 'Past 24 hours' },
            { value: 'past_week', label: 'Past week' },
            { value: 'past_month', label: 'Past month' },
          ]}
        />
      </div>

      {/* Popular Skills Chips */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-700 block">Skills Filter</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SKILLS.map((skill) => {
            const isSelected = selectedSkillsList.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
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
