import React from 'react';
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
} from 'lucide-react';

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

/**
 * Enterprise-grade High-Fidelity Internship Opportunity Card.
 * Clean, modern SaaS aesthetic with official company brand icons.
 * Supports 'grid', 'list', and 'split' layout modes.
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
  const companyName = internship.companyId?.name || internship.company || 'Enterprise Partner';
  const companyLogo = internship.companyId?.logo || internship.companyLogo || null;
  const companySlug = internship.companyId?.slug || internship.companySlug || '';
  const companyWebsite = internship.companyId?.website || internship.companyWebsite || '';
  const isVerified = Boolean(internship.companyId?.verified ?? true);
  const isLiveFeed = Boolean(internship.isLiveFeed);
  const category = internship.category || 'Engineering';

  // Format location
  const locationFormatted =
    typeof internship.location === 'object'
      ? `${internship.location?.city || ''}${
          internship.location?.city && (internship.location?.country || internship.location?.state) ? ', ' : ''
        }${internship.location?.state || internship.location?.country || ''}` || 'Remote Global'
      : internship.location || 'Remote Global';

  // Workplace type formatting
  const remoteType = (internship.remote || internship.locationType || 'REMOTE').toUpperCase();
  const locationType =
    remoteType === 'REMOTE'
      ? 'Remote'
      : remoteType === 'HYBRID'
      ? 'Hybrid'
      : 'On-site';

  // Format stipend
  let stipendFormatted = '$8,500/mo';
  let isHighPay = false;
  if (typeof internship.stipend === 'object' && internship.stipend !== null) {
    if (internship.stipend.isUnpaid) {
      stipendFormatted = 'Unpaid / Credit';
    } else if (internship.stipend.amount) {
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendFormatted = `$${internship.stipend.amount.toLocaleString()}${
        periodMap[internship.stipend.period] || '/mo'
      }`;
      if (
        (internship.stipend.period === 'HOUR' && internship.stipend.amount >= 45) ||
        (internship.stipend.period === 'MONTH' && internship.stipend.amount >= 8500)
      ) {
        isHighPay = true;
      }
    }
  } else if (typeof internship.stipend === 'string') {
    stipendFormatted = internship.stipend;
    if (
      stipendFormatted.includes('$5') ||
      stipendFormatted.includes('$6') ||
      stipendFormatted.includes('$7') ||
      stipendFormatted.includes('$8') ||
      stipendFormatted.includes('$9')
    ) {
      isHighPay = true;
    }
  }

  const postedFormatted = getRelativeTimeAgo(internship.createdAt);
  const daysLeft = getDaysRemaining(internship.applicationDeadline);
  const skills = Array.isArray(internship.skills) ? internship.skills : [];
  const featured = Boolean(internship.featured);
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
        className={`group relative p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
          isSelected
            ? 'bg-brand-50/40 border-brand-500 shadow-md ring-2 ring-brand-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          <CompanyLogo
            companyName={companyName}
            slug={companySlug}
            logo={companyLogo}
            website={companyWebsite}
            className="w-11 h-11 rounded-xl shrink-0"
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-slate-700 truncate">{companyName}</span>
                {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
              </div>
              <span className="text-xs font-black text-emerald-600 font-mono shrink-0">
                {stipendFormatted}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {title}
            </h4>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
              <span className="truncate max-w-[100px]">{locationFormatted}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.2 rounded font-semibold ${locationStyles[locationType] || 'text-slate-600'}`}>
                {locationType}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">{postedFormatted}</span>
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
        className={`group relative rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
          featured ? 'bg-gradient-to-r from-brand-50/20 via-white to-white ring-1 ring-brand-500/20' : ''
        } ${className}`}
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          {/* Official Company Vector/Brand Logo */}
          <CompanyLogo
            companyName={companyName}
            slug={companySlug}
            logo={companyLogo}
            website={companyWebsite}
            className="w-12 h-12 rounded-xl shrink-0"
          />

          {/* Core Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-slate-800 tracking-tight">{companyName}</span>
              {isVerified && (
                <span className="inline-flex items-center text-brand-600" title="Verified Tech Employer">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-brand-50" />
                </span>
              )}
              {isLiveFeed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE
                </span>
              )}
              {featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <Sparkles className="w-2.5 h-2.5 text-brand-500" /> Featured
                </span>
              )}
              {isHighPay && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Flame className="w-2.5 h-2.5 text-amber-500" /> Top Pay
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
              {title}
            </h3>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
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
              <span className="text-slate-300 hidden lg:inline">•</span>
              <div className="hidden lg:flex items-center gap-1.5">
                {skills.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 text-slate-600 font-mono text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Action & Stipend Block */}
        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold block">Monthly Stipend</span>
            <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
              {stipendFormatted}
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
              className={`p-2.5 rounded-xl border transition-all ${
                itemSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>

            {onQuickApply && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickApply?.(internship);
                }}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Apply
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(internship);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all shadow-2xs"
            >
              <span>Quick View</span>
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
      className={`group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden ${
        featured ? 'ring-1 ring-brand-500/20 bg-gradient-to-b from-brand-50/15 via-white to-white' : ''
      } ${className}`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Card Header: Official Company Brand Icon, name, save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <CompanyLogo
              companyName={companyName}
              slug={companySlug}
              logo={companyLogo}
              website={companyWebsite}
              className="w-12 h-12 rounded-2xl group-hover:scale-105 transition-transform shrink-0 border border-slate-100"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                  {companyName}
                </span>
                {isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" title="Verified Tech Employer" />
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
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
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
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {internship.description || 'Join leading engineering teams to build resilient high-impact systems with world-class mentorship.'}
          </p>
        </div>

        {/* Badges & Meta Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-600 font-medium text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{locationFormatted}</span>
          </div>

          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${locationStyles[locationType] || 'bg-slate-100 text-slate-700'}`}>
            {locationType}
          </span>

          {isLiveFeed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
              <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE
            </span>
          )}

          {isHighPay && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Flame className="w-2.5 h-2.5 text-amber-500" /> High Stipend
            </span>
          )}

          {daysLeft !== null && daysLeft <= 14 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              ⏳ {daysLeft}d left
            </span>
          )}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
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

      {/* Card Footer: Stipend + Action CTA */}
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold block">Monthly Stipend</span>
          <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
            {stipendFormatted}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onQuickApply && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickApply?.(internship);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" /> Apply
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(internship);
            }}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-brand-600 transition-all shadow-xs"
          >
            <span>Quick View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InternshipCard;
