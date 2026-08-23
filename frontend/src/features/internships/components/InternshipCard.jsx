import React from 'react';
import {
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Flame,
  Radio,
  ExternalLink,
  Clock,
  Briefcase,
  ShieldCheck,
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
 * Designed with modern aesthetic principles: micro-interactions, subtle glass gradients,
 * visual hierarchy, and dual layout support (Responsive Grid vs Dense Table List).
 */
export function InternshipCard({
  internship,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  layout = 'grid',
  className = '',
}) {
  const id = internship._id || internship.id || internship.slug;
  const title = internship.title || 'Software Engineering Opportunity';
  const companyName = internship.companyId?.name || internship.company || 'Enterprise Partner';
  const companyLogo = internship.companyId?.logo || internship.companyLogo || null;
  const isVerified = Boolean(internship.companyId?.verified ?? true);
  const isLiveFeed = Boolean(internship.isLiveFeed);
  const applyUrl = internship.applyUrl || null;
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
      stipendFormatted = 'Unpaid / Academic Credit';
    } else if (internship.stipend.amount) {
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendFormatted = `$${internship.stipend.amount.toLocaleString()}${
        periodMap[internship.stipend.period] || '/mo'
      }`;
      if ((internship.stipend.period === 'HOUR' && internship.stipend.amount >= 45) ||
          (internship.stipend.period === 'MONTH' && internship.stipend.amount >= 8500)) {
        isHighPay = true;
      }
    }
  } else if (typeof internship.stipend === 'string') {
    stipendFormatted = internship.stipend;
    if (stipendFormatted.includes('$5') || stipendFormatted.includes('$6') || stipendFormatted.includes('$7') || stipendFormatted.includes('$8') || stipendFormatted.includes('$9')) {
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

  // ── List View Variant (Dense Streamlined List) ──────────────────────────────
  if (layout === 'list') {
    return (
      <div
        onClick={() => onViewDetails?.(internship)}
        className={`group relative rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 hover:border-brand-400 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
          featured ? 'bg-gradient-to-r from-brand-50/20 via-white to-white ring-1 ring-brand-500/20' : ''
        } ${className}`}
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          {/* Company Brand Logo Avatar */}
          <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform overflow-hidden relative">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={`${companyName} logo`}
                className="w-full h-full object-contain rounded-xl"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full items-center justify-center text-slate-600 font-bold text-sm"
              style={{ display: companyLogo ? 'none' : 'flex' }}
            >
              <Building2 className="w-6 h-6 text-brand-600" />
            </div>
          </div>

          {/* Core Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-slate-700 tracking-tight">{companyName}</span>
              {isVerified && (
                <span className="inline-flex items-center text-brand-600" title="Verified Tech Employer">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-brand-50" />
                </span>
              )}
              {isLiveFeed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                  <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE 24/7
                </span>
              )}
              {featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <Sparkles className="w-2.5 h-2.5 text-brand-500" /> Featured
                </span>
              )}
              {isHighPay && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
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
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${locationStyles[locationType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
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
        <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold block">Monthly Stipend</span>
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

            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-brand-600 transition-colors shadow-xs"
              >
                Apply Direct <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(internship);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/80 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-xs"
            >
              View Role <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View Variant (Default High-Visual Cards) ───────────────────────────
  return (
    <div
      onClick={() => onViewDetails?.(internship)}
      className={`group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden ${
        featured ? 'ring-1 ring-brand-500/20 bg-gradient-to-b from-brand-50/15 via-white to-white' : ''
      } ${className}`}
    >
      {/* Top Accent bar for Featured items */}
      {featured && (
        <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-600" />
      )}

      <div className="p-5 sm:p-6 space-y-4">
        {/* Card Header: Company logo, name, save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform overflow-hidden relative">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className="w-full h-full object-contain rounded-xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full items-center justify-center text-slate-600 font-bold text-sm"
                style={{ display: companyLogo ? 'none' : 'flex' }}
              >
                <Building2 className="w-6 h-6 text-brand-600" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                  {companyName}
                </span>
                {isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" title="Verified Enterprise Employer" />
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
            className={`p-2.5 rounded-xl border transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              itemSaved
                ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white hover:border-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
          </button>
        </div>

        {/* Role Title */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 tracking-tight">
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
              <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE FEED
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
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold block">Monthly Stipend</span>
          <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
            {stipendFormatted}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
              title="Apply on company website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(internship);
            }}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-brand-600 transition-all shadow-xs group-hover:bg-brand-600"
          >
            Quick View <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InternshipCard;
