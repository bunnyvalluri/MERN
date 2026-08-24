import React from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Badge, Button } from '../../../components/ui/index.js';
import {
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  DollarSign,
  Bookmark,
  Scale,
  Eye,
  Bot,
  Zap,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export function CompanyCard({
  company,
  onQuickPreview,
  onToggleSave,
  isSaved = false,
  onToggleCompare,
  isComparing = false,
}) {
  if (!company) return null;

  const maxStipend = company.compensation?.maxMonthlyStipend || company.compensation?.avgMonthlyStipend;
  const rating = company.ratings?.overall || 4.8;
  const openRoles = company.openRolesCount || 0;
  const aiMatch = company.aiMatch;

  const workPolicyLabelMap = {
    REMOTE_FIRST: 'Remote-First',
    HYBRID: 'Hybrid',
    IN_OFFICE: 'In-Office',
  };

  const workPolicyStyleMap = {
    REMOTE_FIRST: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    HYBRID: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    IN_OFFICE: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-xs hover:shadow-card-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Subtle Brand Gradient Highlight */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-500/30 group-hover:via-brand-500 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Logo, Name, Badges & Save/Compare */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              to={`/companies/${company.slug}`}
              className="shrink-0 transition-transform duration-200 group-hover:scale-105"
            >
              <CompanyLogo
                companyName={company.name}
                slug={company.slug}
                logo={company.logo}
                website={company.website}
                className="w-13 h-13 sm:w-14 sm:h-14 shadow-2xs"
              />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/companies/${company.slug}`}
                  className="font-bold text-base sm:text-lg text-slate-900 hover:text-brand-600 transition-colors truncate"
                >
                  {company.name}
                </Link>
                {company.verified && (
                  <span
                    title="Employer Identity & Internship Verified"
                    className="inline-flex items-center text-brand-600"
                  >
                    <ShieldCheck className="w-4 h-4 fill-brand-50 text-brand-600" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span className="font-medium text-slate-700">{company.category}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'Global HQ'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Icons (Bookmark & Compare) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleCompare && onToggleCompare(company)}
              title={isComparing ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              className={`p-2 rounded-xl transition-all ${
                isComparing
                  ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Compare company"
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onToggleSave && onToggleSave(company)}
              title={isSaved ? 'Remove from saved' : 'Save company'}
              className={`p-2 rounded-xl transition-all ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
              }`}
              aria-label="Save company"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tagline / Pitch */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {company.tagline || company.description}
        </p>

        {/* AI Smart Match Badge (if active) */}
        {aiMatch && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-brand-50/90 via-indigo-50/70 to-purple-50/80 border border-brand-200/70">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-600 text-white font-bold text-2xs shrink-0 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-900 truncate">
                  {aiMatch.score}% Skill Compatibility Match
                </p>
                <p className="text-2xs text-brand-700 truncate">
                  Matched: {aiMatch.matchedSkills.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
            <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-brand-600 text-white shrink-0">
              High Fit
            </span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          {/* Compensation */}
          <div className="p-2 rounded-xl bg-slate-50/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider block font-medium">
              Stipend (Mo)
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
              {maxStipend ? `$${(maxStipend / 1000).toFixed(1)}k` : 'Competitive'}
            </span>
          </div>

          {/* Intern Rating */}
          <div className="p-2 rounded-xl bg-slate-50/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider block font-medium">
              Intern Rating
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 inline-flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          </div>

          {/* Return Offer Rate */}
          <div className="p-2 rounded-xl bg-slate-50/80">
            <span className="text-2xs text-slate-500 uppercase tracking-wider block font-medium">
              Return Offer
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 block mt-0.5">
              {company.ratings?.returnOfferRate || 88}% RO
            </span>
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-2xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Core Tech Stack</span>
            <span className={`px-2 py-0.5 rounded-full text-2xs border font-semibold ${workPolicyStyleMap[company.workPolicy] || workPolicyStyleMap.HYBRID}`}>
              {workPolicyLabelMap[company.workPolicy] || 'Hybrid'}
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            {(company.techStack || ['Python', 'React', 'Cloud']).slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-2xs font-mono font-medium hover:bg-slate-200 transition-colors"
              >
                {tech}
              </span>
            ))}
            {(company.techStack || []).length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-2xs font-medium">
                +{company.techStack.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Active Roles & Action Triggers */}
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Open roles badge */}
        <div>
          {openRoles > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {openRoles} {openRoles === 1 ? 'Open Role' : 'Open Roles'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
              Talent Pool Open
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onQuickPreview && onQuickPreview(company)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition-colors shadow-2xs"
            title="Quick view roles & culture drawer"
          >
            Quick View
          </button>

          <Link to={`/companies/${company.slug}`}>
            <Button
              variant="primary"
              size="sm"
              className="text-xs px-3 py-1.5 rounded-lg group-hover:shadow-glow-brand"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompanyCard;
