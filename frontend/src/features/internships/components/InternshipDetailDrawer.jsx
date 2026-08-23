import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import {
  Button,
  Badge,
} from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import {
  X,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Laptop,
  Bookmark,
  Share2,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Radio,
  Flame,
  Send,
  ChevronLeft,
  ChevronRight,
  Target,
  Briefcase,
  Layers,
  GraduationCap,
  Building,
} from 'lucide-react';

export function InternshipDetailDrawer({
  internship,
  isOpen,
  onClose,
  onApplyClick,
  onToggleSave,
  isSaved,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
  drawerIndex = 0,
}) {
  const { profile } = useSelector((state) => state.student);

  // Keyboard shortcut listener for drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onNavigatePrev) {
        onNavigatePrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNavigateNext) {
        onNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onNavigatePrev, onNavigateNext, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const skills = useMemo(() => {
    return Array.isArray(internship?.skills) ? internship.skills : [];
  }, [internship?.skills]);

  const candidateSkills = useMemo(() => {
    return (profile?.skills || ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python']).map((s) =>
      s.toLowerCase()
    );
  }, [profile?.skills]);

  const matchDetails = useMemo(() => {
    if (skills.length === 0) return { score: 90, matched: [], total: 0 };
    const matched = skills.filter((s) => candidateSkills.includes(s.toLowerCase()));
    const ratio = Math.round((matched.length / skills.length) * 100);
    const score = Math.max(65, Math.min(98, ratio > 0 ? ratio + 20 : 70));
    return { score, matched, total: skills.length };
  }, [skills, candidateSkills]);

  if (!isOpen || !internship) return null;

  const id = internship._id || internship.id || internship.slug;
  const title = internship.title || 'Software Engineering Opportunity';
  const company = internship.companyId || {};
  const companyName = company.name || internship.company || 'Enterprise Partner';
  const companyLogo = company.logo || internship.companyLogo || null;
  const companySlug = company.slug || internship.companySlug || '';
  const companyWebsite = company.website || internship.companyWebsite || '';
  const isVerified = Boolean(company.verified ?? true);
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
    remoteType === 'REMOTE' ? 'Remote' : remoteType === 'HYBRID' ? 'Hybrid' : 'On-site';

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

  const daysUntilDeadline = internship.applicationDeadline
    ? Math.ceil(
        (new Date(internship.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/internships/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify.success('Link copied to clipboard!');
    } catch {
      notify.info(`Share link: ${shareUrl}`);
    }
  };

  const locationStyles = {
    Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Hybrid: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'On-site': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Side Panel (Responsive width on all viewports) */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-in-right border-l border-slate-200">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md shrink-0">
          {/* Navigation between roles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className={`p-1.5 rounded-xl border transition-all ${
                hasPrev
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
              title="Previous Role (Left Arrow)"
              aria-label="Previous role"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNavigateNext}
              disabled={!hasNext}
              className={`p-1.5 rounded-xl border transition-all ${
                hasNext
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
              title="Next Role (Right Arrow)"
              aria-label="Next role"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono ml-1 sm:ml-2">
              Role {drawerIndex + 1}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs"
              title="Share Opportunity"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleSave?.(id)}
              className={`p-2 rounded-xl border transition-all shadow-2xs ${
                isSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Bookmarks'}
              aria-label="Save"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Close Preview (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 touch-scroll">
          
          {/* Header & Company Brand Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <CompanyLogo
                  companyName={companyName}
                  slug={companySlug}
                  logo={companyLogo}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2 shrink-0 border border-slate-200/90 shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {companyName}
                    </span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200/80 font-mono">
                        <ShieldCheck className="w-3 h-3 text-brand-600" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>{category}</span>
                    {companyWebsite && (
                      <>
                        <span>•</span>
                        <a
                          href={companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-600 inline-flex items-center gap-0.5 transition-colors"
                        >
                          Website
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* High Pay / Live Feed Badges */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {isLiveFeed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse font-mono">
                    <Radio className="w-3 h-3 text-amber-600 animate-spin" />
                    Live 24/7
                  </span>
                )}
                {isHighPay && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
                    <Flame className="w-3 h-3 text-emerald-600" />
                    High Stipend
                  </span>
                )}
              </div>
            </div>

            {/* Main Role Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>

            {/* Quick Metrics Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border ${locationStyles[locationType] || locationStyles.Remote}`}>
                <Laptop className="w-3.5 h-3.5" />
                {locationType}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {stipendFormatted}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {locationFormatted}
              </span>

              {daysUntilDeadline !== null && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border ${
                    daysUntilDeadline <= 5
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left to apply` : 'Deadline today'}
                </span>
              )}
            </div>
          </div>

          {/* AI Skill Match Radar Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50/70 via-indigo-50/50 to-slate-50 border border-brand-100/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                  Candidate Profile Skill Match
                </span>
              </div>
              <span className="text-sm font-black text-brand-700 font-mono">
                {matchDetails.score}% Match
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${matchDetails.score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {matchDetails.matched.length > 0
                ? `You match ${matchDetails.matched.length} key required skill${
                    matchDetails.matched.length > 1 ? 's' : ''
                  } for this opportunity.`
                : 'Matches your student profile background and engineering focus areas.'}
            </p>
          </div>

          {/* Key Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Duration
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {internship.duration || '3 - 6 Months'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Openings
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                {internship.openings || 2} Positions
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Experience
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {internship.experienceLevel || 'Intern / College'}
              </p>
            </div>
          </div>

          {/* Required Tech Stack / Skills */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Required Tech Stack & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/30 transition-all shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Role Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              Role Description & Mission
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 prose prose-slate max-w-none">
              <p>
                {internship.description ||
                  'Join our world-class engineering team to build scalable full-stack applications, collaborate with senior architects, and ship impactful software used by millions.'}
              </p>
            </div>
          </div>

          {/* Responsibilities */}
          {Array.isArray(internship.responsibilities) && internship.responsibilities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-500" />
                Key Responsibilities
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {internship.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks & Benefits */}
          {Array.isArray(internship.perks) && internship.perks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Perks & Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {internship.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                    <span className="truncate">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white shadow-lg shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleSave?.(id)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-brand-50 border-brand-200 text-brand-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="font-semibold text-xs whitespace-nowrap"
                >
                  Apply on Career Site
                </Button>
              </a>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => onApplyClick(internship)}
              rightIcon={<Send className="w-3.5 h-3.5" />}
              className="font-bold text-xs shadow-xs flex-1 sm:flex-initial"
            >
              1-Click Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternshipDetailDrawer;
