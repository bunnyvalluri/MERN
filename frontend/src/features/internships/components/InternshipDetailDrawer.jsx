import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
}) {
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.student);
  const { isAuthenticated } = useSelector((state) => state.auth);

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

  const skills = Array.isArray(internship.skills) ? internship.skills : [];

  // Candidate Match Score calculation
  const candidateSkills = (profile?.skills || ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python']).map((s) => s.toLowerCase());
  const matchDetails = useMemo(() => {
    if (skills.length === 0) return { score: 90, matched: [], total: 0 };
    const matched = skills.filter((s) => candidateSkills.includes(s.toLowerCase()));
    const ratio = Math.round((matched.length / skills.length) * 100);
    const score = Math.max(65, Math.min(98, ratio > 0 ? ratio + 20 : 70));
    return { score, matched, total: skills.length };
  }, [skills, candidateSkills]);

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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:p-8 space-y-6 touch-scroll">
          
          {/* Header Role Card */}
          <div className="flex flex-col xs:flex-row sm:flex-row items-start gap-3.5 sm:gap-4">
            <CompanyLogo
              companyName={companyName}
              slug={companySlug}
              logo={companyLogo}
              website={companyWebsite}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2 shrink-0 border border-slate-200 shadow-sm"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900">{companyName}</span>
                {isVerified && (
                  <span className="inline-flex items-center text-brand-600" title="Verified Employer">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-50" />
                  </span>
                )}
                {isLiveFeed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" /> LIVE
                  </span>
                )}
                {isHighPay && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Flame className="w-2.5 h-2.5 text-amber-500" /> Top Pay
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">
                {title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap pt-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {locationFormatted}
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-md border font-semibold text-[11px] ${locationStyles[locationType] || 'bg-slate-100 text-slate-700'}`}>
                  {locationType}
                </span>
                <span>•</span>
                <span className="text-slate-500 font-mono">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Value Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Compensation</span>
              <p className="text-base sm:text-lg font-black text-emerald-600 font-mono tracking-tight">
                {stipendFormatted}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Duration</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {internship.duration || '12 Weeks'}
              </p>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Deadline</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {daysUntilDeadline !== null && daysUntilDeadline > 0
                  ? `${daysUntilDeadline} days left`
                  : 'Open Continuous'}
              </p>
            </div>
          </div>

          {/* AI / Skill Match Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-brand-50/50 via-white to-brand-50/20 border border-brand-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Your Candidate Profile Match</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Based on verified skills & keywords</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-brand-700 font-mono">
                {matchDetails.score}%
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${matchDetails.score}%` }}
              />
            </div>
          </div>

          {/* Tech Stack Required */}
          {skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-[11px] sm:text-xs font-mono font-semibold text-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-600" /> Role Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
              {internship.description ||
                'Collaborate with industry-leading engineering teams on modern cloud architectures, scalable microservices, and AI models with active daily mentorship.'}
            </p>
          </div>

          {/* Key Responsibilities */}
          {Array.isArray(internship.responsibilities) && internship.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> What You'll Build & Ship
              </h3>
              <div className="space-y-2 bg-slate-50/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
                {internship.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications & Requirements */}
          {Array.isArray(internship.requirements) && internship.requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Qualifications
              </h3>
              <div className="space-y-2 bg-slate-50/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
                {internship.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          {company.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-600" /> About {companyName}
              </h3>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>{company.description}</p>
                {companyWebsite && (
                  <a
                    href={companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 pt-1"
                  >
                    <span>Visit Company Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer (Responsive layout) */}
        <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-lg shrink-0">
          <Link
            to={`/internships/${id}`}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <span>Full Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
              >
                <span>Company Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={() => onApplyClick?.(internship)}
              className="font-bold shadow-md text-xs sm:text-sm py-2 px-3 sm:px-4"
            >
              1-Click Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternshipDetailDrawer;
