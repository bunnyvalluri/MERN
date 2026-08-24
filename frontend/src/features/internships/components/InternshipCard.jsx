import React from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import {
  Bookmark,
  MapPin,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Flame,
  Radio,
  ExternalLink,
  Clock,
  Send,
  Eye,
  Building,
  Bot,
  Zap,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

function getRelativeTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffSecs = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDaysRemaining(deadlineString) {
  if (!deadlineString) return null;
  const diff = new Date(deadlineString).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  return days > 0 ? days : 0;
}

function formatStipend(stipend) {
  if (!stipend) return { display: 'Disclosed on Application', sub: 'Competitive' };

  if (typeof stipend === 'object') {
    if (stipend.isUnpaid) {
      return { display: 'Unpaid / Credit', sub: 'Academic Credit' };
    }
    if (stipend.amount && stipend.amount > 0) {
      const sym = stipend.currency === 'USD' ? '$' : '₹';
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total', YEAR: '/yr' };
      const period = periodMap[stipend.period] || '/mo';
      return {
        display: `${sym}${Number(stipend.amount).toLocaleString()}${period}`,
        sub: stipend.currency === 'USD' ? 'USD Compensation' : 'INR Compensation',
      };
    }
    if (stipend.minAmount && stipend.maxAmount) {
      const sym = stipend.currency === 'USD' ? '$' : '₹';
      return {
        display: `${sym}${Number(stipend.minAmount).toLocaleString()} - ${sym}${Number(stipend.maxAmount).toLocaleString()}/mo`,
        sub: 'Performance Range',
      };
    }
  }

  if (typeof stipend === 'string' && stipend.trim().length > 0) {
    return { display: stipend, sub: 'Stipend Range' };
  }

  return { display: 'Disclosed on Application', sub: 'Verified by Partner' };
}

/**
 * Enterprise-grade Internship Opportunity Card.
 * Clean, modern SaaS aesthetic with verified badges, provenance, and authentic compensation.
 */
export function InternshipCard({
  internship,
  isSaved = false,
  isSelected = false,
  onToggleSave,
  onViewDetails,
  onQuickApply,
  layout = 'grid',
  className = '',
}) {
  const id = internship._id || internship.id || internship.slug;
  const title = internship.title || 'Software Engineering Opportunity';
  const companyName = internship.companyName || internship.companyId?.name || internship.company || 'Enterprise Partner';
  const companyLogo = internship.companyLogo || internship.companyId?.logo || null;
  const companySlug = internship.companyId?.slug || internship.companySlug || '';
  const companyWebsite = internship.companyWebsite || internship.companyId?.website || '';
  const isVerified = Boolean(internship.isVerified ?? internship.companyId?.verified ?? true);
  const sourceName = internship.source || (internship.sourceType === 'API' ? 'Partner Feed' : 'InternHub');
  const isExternal = internship.applicationMethod === 'EXTERNAL' || Boolean(internship.applicationUrl);
  const category = internship.category || 'Software Development';
  const aiMatch = internship.aiMatch;

  // Format location
  const locationFormatted =
    typeof internship.location === 'object' && internship.location !== null
      ? `${internship.location.city || ''}${
          internship.location.city && (internship.location.country || internship.location.state) ? ', ' : ''
        }${internship.location.state || internship.location.country || ''}` || 'Remote'
      : internship.city || internship.location || 'Remote';

  // Workplace type formatting
  const remoteType = (internship.workMode || internship.remote || 'REMOTE').toUpperCase();
  const locationType =
    remoteType === 'REMOTE'
      ? 'Remote'
      : remoteType === 'HYBRID'
      ? 'Hybrid'
      : 'On-site';

  const { display: stipendFormatted, sub: stipendSub } = formatStipend(internship.stipend);

  const postedFormatted = getRelativeTimeAgo(internship.postedAt || internship.createdAt);
  const verifiedFormatted = getRelativeTimeAgo(internship.lastVerifiedAt);
  const daysLeft = getDaysRemaining(internship.applicationDeadline);
  const skills = Array.isArray(internship.skills) ? internship.skills : [];
  const featured = Boolean(internship.isFeatured || internship.featured);
  const itemSaved = isSaved || Boolean(internship.isSaved);

  const locationStyles = {
    Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Hybrid: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    'On-site': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  // ── Split View Item Variant ────────────────────────────────────────────────
  if (layout === 'split') {
    return (
      <div
        onClick={() => onViewDetails?.(internship)}
        className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-brand-50/50 border-brand-500 shadow-md ring-2 ring-brand-500/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          <CompanyLogo
            companyName={companyName}
            slug={companySlug}
            logo={companyLogo}
            website={companyWebsite}
            className="w-11 h-11 rounded-xl shrink-0 shadow-2xs"
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-slate-700 truncate">{companyName}</span>
                {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
              </div>
              <span className="text-xs font-bold text-emerald-600 font-mono shrink-0">
                {stipendFormatted}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {title}
            </h4>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
              <span className="truncate max-w-[110px]">{locationFormatted}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.2 rounded font-semibold ${locationStyles[locationType] || 'text-slate-600'}`}>
                {locationType}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">{postedFormatted}</span>
            </div>

            <div className="pt-1 flex items-center justify-between gap-1 text-[10px] text-slate-400">
              <span className="truncate">Source: {sourceName}</span>
              {internship.lastVerifiedAt && <span>Verified {verifiedFormatted}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List View Variant ───────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <div
        onClick={() => onViewDetails?.(internship)}
        className={`group relative rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer ${
          featured ? 'bg-gradient-to-r from-brand-50/25 via-white to-white ring-1 ring-brand-500/20' : ''
        } ${className}`}
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <CompanyLogo
            companyName={companyName}
            slug={companySlug}
            logo={companyLogo}
            website={companyWebsite}
            className="w-12 h-12 rounded-xl shrink-0 shadow-2xs border border-slate-100"
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {companySlug ? (
                <Link
                  to={`/companies/${companySlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-slate-800 hover:text-brand-600 tracking-tight transition-colors"
                >
                  {companyName}
                </Link>
              ) : (
                <span className="text-xs font-bold text-slate-800 tracking-tight">{companyName}</span>
              )}
              {isVerified && (
                <span className="inline-flex items-center text-brand-600" title="Verified Opportunity">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-brand-50" />
                </span>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono font-medium">{category}</span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
                <Globe2 className="w-2.5 h-2.5 text-slate-400" /> {sourceName}
              </span>

              {featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <Sparkles className="w-2.5 h-2.5 text-brand-500" /> Featured
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
              {title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {locationFormatted}
              </span>
              <span className="text-slate-300">•</span>
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${locationStyles[locationType] || 'bg-slate-100 text-slate-700'}`}>
                {locationType}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3 text-slate-400" /> {postedFormatted}
              </span>
              <span className="text-slate-300 hidden xl:inline">•</span>
              <div className="hidden xl:flex items-center gap-1.5">
                {skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 text-slate-600 font-mono text-[10px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Compensation Block */}
        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
          <div className="text-left lg:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">Compensation</span>
            <span className="text-base font-bold text-emerald-600 font-mono tracking-tight block">
              {stipendFormatted}
            </span>
            <span className="text-2xs text-slate-400 font-mono block">
              {stipendSub}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(id);
              }}
              aria-label={itemSaved ? 'Remove from saved' : 'Save internship'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                itemSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>

            {isExternal && internship.applicationUrl ? (
              <a
                href={internship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                <span>Apply on Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : onQuickApply ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickApply?.(internship);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Quick Apply
              </button>
            ) : null}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(internship);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all shadow-2xs cursor-pointer"
            >
              <span>Details</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View Variant ───────────────────────────────────────────────────────
  return (
    <div
      onClick={() => onViewDetails?.(internship)}
      className={`group relative flex flex-col justify-between h-full rounded-3xl bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden ${
        featured ? 'ring-1 ring-brand-500/20 bg-gradient-to-b from-brand-50/20 via-white to-white' : ''
      } ${className}`}
    >
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Top Header Block */}
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {companySlug ? (
                <Link
                  to={`/companies/${companySlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <CompanyLogo
                    companyName={companyName}
                    slug={companySlug}
                    logo={companyLogo}
                    website={companyWebsite}
                    className="w-12 h-12 rounded-2xl group-hover:scale-105 transition-transform shrink-0 border border-slate-100 shadow-2xs"
                  />
                </Link>
              ) : (
                <CompanyLogo
                  companyName={companyName}
                  slug={companySlug}
                  logo={companyLogo}
                  website={companyWebsite}
                  className="w-12 h-12 rounded-2xl group-hover:scale-105 transition-transform shrink-0 border border-slate-100 shadow-2xs"
                />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {companySlug ? (
                    <Link
                      to={`/companies/${companySlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-slate-800 hover:text-brand-600 transition-colors truncate"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-slate-800 truncate">{companyName}</span>
                  )}
                  {isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" title="Verified Opportunity" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {category}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(id);
              }}
              aria-label={itemSaved ? 'Remove from saved' : 'Save internship'}
              className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                itemSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>
          </div>

          {/* Role Title & Summary */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
              {internship.shortDescription || internship.description || `Engineering opportunity at ${companyName}.`}
            </p>
          </div>
        </div>

        {/* Middle Metadata Block */}
        <div className="space-y-3 pt-2">
          {/* Badges & Meta Tags */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-600 font-medium text-[11px]">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[120px]">{locationFormatted}</span>
            </div>

            <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${locationStyles[locationType] || 'bg-slate-100 text-slate-700'}`}>
              {locationType}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
              <Globe2 className="w-2.5 h-2.5 text-slate-400" /> {sourceName}
            </span>

            {daysLeft !== null && daysLeft <= 14 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                ⏳ {daysLeft}d left
              </span>
            )}
          </div>

          {/* Tech Stack Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] font-medium group-hover:border-slate-300 transition-colors"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="text-[11px] text-slate-400 font-mono font-medium px-1">
                +{skills.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Stipend + Action CTA */}
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">Compensation</span>
          <span className="text-base font-bold text-emerald-600 font-mono tracking-tight block">
            {stipendFormatted}
          </span>
          <span className="text-2xs text-slate-400 font-mono">
            {stipendSub}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExternal && internship.applicationUrl ? (
            <a
              href={internship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs cursor-pointer"
            >
              <span>Apply</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : onQuickApply ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickApply?.(internship);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Apply
            </button>
          ) : null}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(internship);
            }}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-brand-600 transition-all shadow-xs cursor-pointer"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InternshipCard;
