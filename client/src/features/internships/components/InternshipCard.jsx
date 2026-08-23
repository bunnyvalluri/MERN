import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '../../../components/ui/index.js';
import {
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

/**
 * Reusable Internship Opportunity Card.
 * Gracefully formats both database documents and display fixtures.
 */
export function InternshipCard({
  internship,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  className = '',
}) {
  const id = internship._id || internship.id;
  const title = internship.title || 'Software Engineering Intern';
  const companyName = internship.companyId?.name || internship.company || 'Company';
  const companyLogo = internship.companyId?.logo || internship.companyLogo || null;
  const isVerified = Boolean(internship.companyId?.verified);

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
  if (typeof internship.stipend === 'object' && internship.stipend !== null) {
    if (internship.stipend.isUnpaid) {
      stipendFormatted = 'Unpaid';
    } else if (internship.stipend.amount) {
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total' };
      stipendFormatted = `$${internship.stipend.amount.toLocaleString()}${
        periodMap[internship.stipend.period] || '/mo'
      }`;
    }
  } else if (typeof internship.stipend === 'string') {
    stipendFormatted = internship.stipend;
  }

  // Format posted date
  const postedFormatted = internship.createdAt
    ? new Date(internship.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : internship.postedDate || 'Recent';

  const skills = Array.isArray(internship.skills) ? internship.skills : [];
  const category = internship.category;
  const featured = Boolean(internship.featured);

  const locationBadgeVariants = {
    Remote: 'info',
    Hybrid: 'primary',
    'On-site': 'neutral',
  };

  const itemSaved = isSaved || Boolean(internship.isSaved);

  return (
    <Card
      hoverable
      className={`relative flex flex-col justify-between transition-all duration-200 group border-slate-800/80 bg-slate-900/70 hover:border-slate-700 ${
        featured ? 'ring-1 ring-brand-500/40 bg-gradient-to-b from-brand-950/20 to-slate-900/90' : ''
      } ${className}`}
    >
      <div>
        <CardHeader className="pb-3 border-b-0">
          <div className="flex items-start justify-between gap-3">
            {/* Company Logo & Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
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
                  className="w-full h-full items-center justify-center text-slate-300 font-bold text-sm"
                  style={{ display: companyLogo ? 'none' : 'flex' }}
                >
                  <Building2 className="w-5 h-5 text-brand-400" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-300 hover:text-white transition-colors truncate">
                    {companyName}
                  </span>
                  {isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" title="Verified Company" />
                  )}
                  {featured && (
                    <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
                      <Sparkles className="w-3 h-3 mr-1 text-brand-300" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 group-hover:text-brand-300 transition-colors line-clamp-1 tracking-tight">
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
              className={`p-2 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 ${
                itemSaved
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${itemSaved ? 'fill-brand-400 text-brand-400' : ''}`} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-1 pb-4 space-y-4">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
            <div className="flex items-center gap-1 text-slate-400 font-medium truncate max-w-[150px]">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{locationFormatted}</span>
            </div>
            <Badge variant={locationBadgeVariants[locationType] || 'neutral'} size="sm">
              {locationType}
            </Badge>
            {category && (
              <Badge variant="neutral" size="sm" className="hidden sm:inline-flex">
                {category}
              </Badge>
            )}
          </div>

          {/* Skills Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="text-[11px] text-slate-500 font-mono px-1">
                +{skills.length - 4}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      {/* Card Footer */}
      <CardFooter className="pt-3 pb-4 justify-between bg-slate-950/40 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200 text-sm">{stipendFormatted}</span>
          <span className="text-slate-500 hidden sm:inline">• {postedFormatted}</span>
        </div>

        <Button
          variant="secondary"
          size="xs"
          rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          onClick={() => onViewDetails?.(internship)}
          className="group-hover:border-brand-500/50 group-hover:text-brand-300"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default InternshipCard;
