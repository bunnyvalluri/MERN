import React from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Button } from '../../../components/ui/index.js';
import {
  ShieldCheck,
  MapPin,
  Star,
  ArrowRight,
  Scale,
  Bookmark,
  Bot,
  Building2,
} from 'lucide-react';

export function CompanyListRow({
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

  return (
    <div className="group bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200/90 hover:border-brand-300 p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Logo, Name, Sector, HQ */}
      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
        <Link
          to={`/companies/${company.slug}`}
          className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        >
          <CompanyLogo
            companyName={company.name}
            slug={company.slug}
            logo={company.logo}
            website={company.website}
            className="w-12 h-12 sm:w-14 sm:h-14 shadow-2xs"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/companies/${company.slug}`}
              className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors"
            >
              {company.name}
            </Link>
            {company.verified && (
              <span title="Verified Employer" className="inline-flex items-center text-brand-600">
                <ShieldCheck className="w-4 h-4 fill-brand-50" />
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
              {company.category}
            </span>
            {aiMatch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                <Bot className="w-3 h-3" />
                {aiMatch.score}% AI Match
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
            {company.tagline || company.description}
          </p>

          <div className="flex items-center gap-3 text-2xs text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'San Francisco, CA'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              {company.companySize || '1,000+'} employees
            </span>
            <span className="text-slate-300">•</span>
            <span>Founded {company.foundedYear || 2015}</span>
          </div>
        </div>
      </div>

      {/* Middle: Tech Stack Pills (Desktop) */}
      <div className="hidden xl:flex items-center gap-1.5 shrink-0 max-w-xs flex-wrap">
        {(company.techStack || []).slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-2xs font-mono font-medium"
          >
            {tech}
          </span>
        ))}
        {(company.techStack || []).length > 3 && (
          <span className="text-2xs text-slate-400 font-mono">
            +{company.techStack.length - 3}
          </span>
        )}
      </div>

      {/* Right: Compensation, Rating, Open Roles & Action Buttons */}
      <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
        {/* Metrics summary */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-2xs text-slate-400 uppercase tracking-wider block font-medium">
              Stipend (Mo)
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {maxStipend ? `$${(maxStipend / 1000).toFixed(1)}k` : 'Competitive'}
            </span>
          </div>

          <div>
            <span className="text-2xs text-slate-400 uppercase tracking-wider block font-medium">
              Rating
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          </div>

          <div>
            <span className="text-2xs text-slate-400 uppercase tracking-wider block font-medium">
              Status
            </span>
            {openRoles > 0 ? (
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {openRoles} Roles
              </span>
            ) : (
              <span className="text-2xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Talent Pool
              </span>
            )}
          </div>
        </div>

        {/* Buttons & Icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleCompare && onToggleCompare(company)}
            title={isComparing ? 'Remove from comparison' : 'Compare'}
            className={`p-2 rounded-xl transition-all ${
              isComparing
                ? 'bg-brand-50 text-brand-600 border border-brand-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave && onToggleSave(company)}
            title={isSaved ? 'Remove from saved' : 'Save'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onQuickPreview && onQuickPreview(company)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors shadow-2xs"
          >
            Preview
          </button>

          <Link to={`/companies/${company.slug}`}>
            <Button variant="primary" size="sm" className="text-xs px-3 py-1.5 rounded-lg">
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompanyListRow;
