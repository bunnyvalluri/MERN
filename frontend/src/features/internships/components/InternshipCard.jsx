import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, Button } from '../../../components/ui/index.js';
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

/**
 * Modern High-Fidelity Internship Opportunity Card with 24/7 Live Status.
 * Supports both modern Responsive Grid and Dense List layout views.
 */
export function InternshipCard({
  internship,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  layout = 'grid',
  className = '',
}) {
  const id = internship._id || internship.id;
  const title = internship.title || 'Software Engineering Intern';
  const companyName = internship.companyId?.name || internship.company || 'Company';
  const companyLogo = internship.companyId?.logo || internship.companyLogo || null;
  const isVerified = Boolean(internship.companyId?.verified ?? true);
  const isLiveFeed = Boolean(internship.isLiveFeed);
  const applyUrl = internship.applyUrl || null;

  // Format location
  const locationFormatted =
    typeof internship.location === 'object'
      ? `${internship.location?.city || ''}${
          internship.location?.city && internship.location?.country ? ', ' : ''
        }${internship.location?.country || ''}` || 'Remote'
      : internship.location || 'Remote';

  // Format workplace type
  const remoteType = internship.remote || internship.locationType || 'Remote';
  const locationType =
    remoteType === 'REMOTE'
      ? 'Remote'
      : remoteType === 'HYBRID'
      ? 'Hybrid'
      : remoteType === 'ONSITE'
      ? 'On-site'
      : remoteType;

  // Format stipend
  let stipendFormatted = 'Competitive';
  let isHighPay = false;
  if (typeof internship.stipend === 'object' && internship.stipend !== null) {
    if (internship.stipend.isUnpaid) {
      stipendFormatted = 'Unpaid';
    } else if (internship.stipend.amount) {
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendFormatted = `$${internship.stipend.amount.toLocaleString()}${
        periodMap[internship.stipend.period] || '/mo'
      }`;
      if ((internship.stipend.period === 'HOUR' && internship.stipend.amount >= 50) ||
          (internship.stipend.period === 'MONTH' && internship.stipend.amount >= 9000)) {
        isHighPay = true;
      }
    }
  } else if (typeof internship.stipend === 'string') {
    stipendFormatted = internship.stipend;
    if (stipendFormatted.includes('$5') || stipendFormatted.includes('$6') || stipendFormatted.includes('$7')) {
      isHighPay = true;
    }
  }

  // Format dynamic relative posted date
  const postedFormatted = getRelativeTimeAgo(internship.createdAt);

  const skills = Array.isArray(internship.skills) ? internship.skills : [];
  const featured = Boolean(internship.featured);

  const locationBadgeStyles = {
    Remote: 'bg-sky-50 text-sky-700 border-sky-200/80',
    Hybrid: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    'On-site': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const itemSaved = isSaved || Boolean(internship.isSaved);

  // ── List View Variant ────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <div
        onClick={() => onViewDetails?.(internship)}
        className={`group relative rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-card-hover transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
          featured ? 'bg-gradient-to-r from-brand-50/30 via-white to-white ring-1 ring-brand-500/20' : ''
        } ${className}`}
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={`${companyName} logo`}
                className="w-full h-full object-contain rounded"
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
              <Building2 className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700">{companyName}</span>
              {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
              {isLiveFeed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300/80 animate-pulse">
                  <Radio className="w-2.5 h-2.5 text-emerald-600" /> Live Feed
                </span>
              )}
              {featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <Sparkles className="w-2.5 h-2.5" /> Featured
                </span>
              )}
              {isHighPay && (
                <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Flame className="w-2.5 h-2.5 text-amber-600" /> High Stipend
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {locationFormatted}
              </span>
              <span className="text-slate-300">•</span>
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${locationBadgeStyles[locationType] || 'bg-slate-100'}`}>
                {locationType}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3 text-slate-400" /> {postedFormatted}
              </span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <div className="hidden md:flex items-center gap-1.5">
                {skills.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-mono">Stipend</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono tracking-tight">
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
              className={`p-2 rounded-xl border transition-all ${
                itemSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600' : ''}`} />
            </button>
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Apply Direct <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(internship);
              }}
              className="font-medium shrink-0 group-hover:border-brand-300 group-hover:text-brand-600"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View Variant (Default) ─────────────────────────────────────────────
  return (
    <Card
      hoverable
      onClick={() => onViewDetails?.(internship)}
      className={`relative flex flex-col justify-between transition-all duration-200 group border-slate-200/90 bg-white hover:border-brand-200 hover:shadow-card-hover cursor-pointer rounded-2xl overflow-hidden ${
        featured ? 'ring-1 ring-brand-500/20 bg-gradient-to-b from-brand-50/20 via-white to-white' : ''
      } ${className}`}
    >
      <div>
        <CardHeader className="pb-3 border-b-0">
          <div className="flex items-start justify-between gap-3">
            {/* Company Logo & Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={`${companyName} logo`}
                    className="w-full h-full object-contain rounded"
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
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                    {companyName}
                  </span>
                  {isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" title="Verified Company" />
                  )}
                  {isLiveFeed && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 group-hover:text-brand-600 transition-colors line-clamp-1 tracking-tight">
                  {title}
                </h3>
              </div>
            </div>

            {/* Save Bookmark Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(id);
              }}
              aria-label={itemSaved ? 'Remove from saved' : 'Save internship'}
              className={`p-2 rounded-xl border transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                itemSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-1 pb-4 space-y-3.5">
          {/* Metadata Badges & Perks */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-medium truncate max-w-[130px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{locationFormatted}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${locationBadgeStyles[locationType] || 'bg-slate-100'}`}>
              {locationType}
            </span>
            {featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
            {isHighPay && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Zap className="w-2.5 h-2.5 text-amber-600" /> High Stipend
              </span>
            )}
          </div>

          {/* Skills Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 font-mono text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="text-[11px] text-slate-400 font-mono px-1">
                +{skills.length - 4}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      {/* Card Footer */}
      <CardFooter className="pt-3 pb-3.5 justify-between bg-slate-50/70 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs">
          <div className="flex items-center font-bold text-emerald-700 font-mono text-sm">
            <DollarSign className="w-3.5 h-3.5 -mr-0.5 text-emerald-600" />
            {stipendFormatted.replace('$', '')}
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            • {postedFormatted}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
              title="Apply directly on company portal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Button
            variant="secondary"
            size="xs"
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(internship);
            }}
            className="font-medium group-hover:border-brand-300 group-hover:text-brand-600 shadow-none"
          >
            Quick View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default InternshipCard;
