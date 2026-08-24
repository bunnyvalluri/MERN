import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Check,
  Plus,
  X,
  Target,
  RotateCcw,
  Cpu,
  Database,
  Layers,
  TrendingUp,
  ShieldCheck,
  Code2,
} from 'lucide-react';

const ENGINEERING_TRACKS = [
  {
    id: 'ai-engineer',
    label: 'Senior AI & ML Engineer',
    icon: Bot,
    skills: ['Python', 'PyTorch', 'CUDA', 'Transformers', 'LLMs', 'LangChain', 'TensorFlow', 'Vector DBs'],
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'ai-database',
    label: 'AI Database & Systems Engineer',
    icon: Database,
    skills: ['PostgreSQL', 'Vector DBs', 'ClickHouse', 'Redis', 'C++', 'Rust', 'Raft', 'RocksDB', 'Distributed Systems'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'full-stack',
    label: 'Full-Stack & Cloud Architect',
    icon: Layers,
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'Tailwind CSS', 'Docker', 'AWS', 'PostgreSQL'],
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'quant-systems',
    label: 'High-Performance & Quant Systems',
    icon: TrendingUp,
    skills: ['C++', 'Rust', 'Python', 'Low Latency', 'CUDA', 'Distributed Systems', 'Linux Kernel', 'WebAssembly'],
    color: 'from-amber-500 to-orange-600',
  },
];

const SKILL_CATEGORIES = {
  'AI & Machine Learning': ['PyTorch', 'Python', 'CUDA', 'Transformers', 'LLMs', 'LangChain', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Triton'],
  'Databases & Storage': ['PostgreSQL', 'Vector DBs', 'ClickHouse', 'Redis', 'MongoDB', 'RocksDB', 'CockroachDB', 'Raft', 'Elasticsearch'],
  'Frontend & Modern Web': ['React', 'TypeScript', 'Next.js', 'JavaScript', 'Tailwind CSS', 'Vue.js', 'WebGL', 'HTML5/CSS3'],
  'Backend & Distributed': ['Node.js', 'Go', 'Rust', 'C++', 'Java', 'GraphQL', 'gRPC', 'Kafka', 'Distributed Systems'],
  'Cloud, Infra & Systems': ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Linux Kernel', 'eBPF', 'Terraform', 'WebAssembly'],
};

export function CompanySmartMatchWidget({
  userSkills = [],
  onSkillsChange,
  isActive = false,
  onToggleActive,
}) {
  const [customInput, setCustomInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const handleToggleSkill = (skill) => {
    if (userSkills.includes(skill)) {
      onSkillsChange(userSkills.filter((s) => s !== skill));
    } else {
      onSkillsChange([...userSkills, skill]);
    }
  };

  const handleApplyTrack = (trackSkills) => {
    // Merge track skills with existing or replace
    const combined = Array.from(new Set([...userSkills, ...trackSkills]));
    onSkillsChange(combined);
  };

  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;
    const clean = customInput.trim();
    if (!userSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      onSkillsChange([...userSkills, clean]);
    }
    setCustomInput('');
  };

  const handleClearSkills = () => {
    onSkillsChange([]);
  };

  const displayedSkills = activeCategory === 'All'
    ? Array.from(new Set(Object.values(SKILL_CATEGORIES).flat()))
    : SKILL_CATEGORIES[activeCategory] || [];

  return (
    <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-br from-white via-brand-50/20 to-indigo-50/30 p-5 sm:p-7 shadow-lg shadow-brand-500/5 relative overflow-hidden transition-all duration-300">
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/8 rounded-full blur-[100px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/6 rounded-full blur-[90px] pointer-events-none -z-0" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25 shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  AI Neural Skill Matcher & Engineering Radar
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-700 border border-brand-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-600" />
                  Neural v4.2
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Target your tech stack to instantly score live opportunity compatibility across 2,450+ verified engineering roles.
              </p>
            </div>
          </div>

          {/* Quick Clear & Active Count */}
          <div className="flex items-center gap-2 shrink-0">
            {userSkills.length > 0 && (
              <>
                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 shadow-2xs">
                  {userSkills.length} {userSkills.length === 1 ? 'Skill' : 'Skills'} Active
                </span>
                <button
                  type="button"
                  onClick={handleClearSkills}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  title="Clear selected skills"
                  aria-label="Clear selected skills"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
            {onToggleActive && (
              <button
                type="button"
                onClick={onToggleActive}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                aria-label="Close skill radar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Track Profiles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-brand-600" /> Quick-Apply Engineering Specializations:
            </span>
            <span className="text-slate-400 text-2xs hidden sm:inline">Click a track to load its verified skillset</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ENGINEERING_TRACKS.map((track) => {
              const Icon = track.icon;
              const trackSkillsPresent = track.skills.every((s) => userSkills.includes(s));
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleApplyTrack(track.skills)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 cursor-pointer ${
                    trackSkillsPresent
                      ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${track.color} text-white flex items-center justify-center shadow-2xs shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 leading-tight">
                      {track.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {track.skills.slice(0, 3).join(', ')}...
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['All', ...Object.keys(SKILL_CATEGORIES)].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white/70 hover:bg-white text-slate-600 border border-slate-200/70 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Selection Pills */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-1">
          {displayedSkills.map((skill) => {
            const isSelected = userSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleToggleSkill(skill)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs border border-brand-700 scale-102'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3 h-3 text-slate-400" />}
                {skill}
              </button>
            );
          })}
        </div>

        {/* Custom Skill Input */}
        <form onSubmit={handleAddCustomSkill} className="flex items-center gap-2 max-w-md pt-1">
          <div className="relative flex-1">
            <Code2 className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add custom skill (e.g. Triton, Raft, WebGPU, Zig, eBPF)..."
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition font-mono shadow-2xs"
            />
          </div>
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            Add Skill
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanySmartMatchWidget;

