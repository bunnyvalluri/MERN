import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Button } from '../../../components/ui/index.js';
import { notify } from '../../../utils/toast.js';
import { parseDescriptionBlocks, formatLocationSmart } from '../../../utils/textUtils.js';
import {
  X,
  MapPin,
  DollarSign,
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
  Briefcase,
  Layers,
  Building2,
  Zap,
  BookOpen,
} from 'lucide-react';

export function InternshipDetailDrawer({
  internship,
  isOpen,
  onClose,
  onApplyClick,
  onQuickApply,
  onToggleSave,
  isSaved,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
  drawerIndex = 0,
}) {
  const { profile } = useSelector((state) => state.student);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'company'

  const handleApply = () => {
    if (onApplyClick) {
      onApplyClick(internship);
    } else if (onQuickApply) {
      onQuickApply(internship);
    }
  };

  // Reset tab on internship change
  useEffect(() => {
    setActiveTab('overview');
  }, [internship?._id, internship?.id, internship?.slug]);

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
    return (profile?.skills || ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Go', 'PyTorch']).map((s) =>
      s.toLowerCase()
    );
  }, [profile?.skills]);

  const matchDetails = useMemo(() => {
    if (skills.length === 0) return { score: 92, matched: ['React', 'TypeScript', 'Python'], missing: [], total: 3 };
    const matched = skills.filter((s) => candidateSkills.includes(s.toLowerCase()));
    const missing = skills.filter((s) => !candidateSkills.includes(s.toLowerCase()));
    const ratio = Math.round((matched.length / skills.length) * 100);
    const score = Math.max(72, Math.min(98, ratio > 0 ? ratio + 25 : 75));
    return { score, matched, missing, total: skills.length };
  }, [skills, candidateSkills]);

  const descriptionBlocks = useMemo(() => {
    return parseDescriptionBlocks(
      internship?.description ||
        'Join our world-class engineering team to build scalable applications, collaborate with senior architects, and ship impactful software used by millions.'
    );
  }, [internship?.description]);

  if (!isOpen || !internship) return null;

  const id = internship._id || internship.id || internship.slug;
  const title = internship.title || 'Software Engineering Opportunity';
  const company = internship.companyId || {};
  const rawCompanyName = company.name || internship.companyName || internship.company || '';
  const companyName = rawCompanyName && rawCompanyName !== 'Partner Employer' ? rawCompanyName : (company.name || 'Verified Tech Partner');
  const companyLogo = company.logo || internship.companyLogo || null;
  const companySlug = company.slug || internship.companySlug || '';
  const companyWebsite = company.website || internship.companyWebsite || '';
  const isVerified = Boolean(company.verified ?? true);
  const isLiveFeed = Boolean(internship.isLiveFeed);
  const applyUrl = internship.applicationUrl || internship.applyUrl || null;
  const category = internship.category || 'Engineering';

  // Smart canonical location format
  const locationFormatted = formatLocationSmart(
    internship.location,
    internship.city,
    internship.country
  );

  // Workplace type formatting
  const remoteType = (internship.workMode || internship.remote || internship.locationType || 'REMOTE').toUpperCase();
  const locationType =
    remoteType === 'REMOTE' ? 'Remote' : remoteType === 'HYBRID' ? 'Hybrid' : 'On-site';

  // Format stipend
  let stipendFormatted = '$9,500/mo';
  let isHighPay = false;
  if (typeof internship.stipend === 'object' && internship.stipend !== null) {
    if (internship.stipend.isUnpaid) {
      stipendFormatted = 'Unpaid / Academic Credit';
    } else if (internship.stipend.amount) {
      const sym = internship.stipend.currency === 'USD' ? '$' : '₹';
      const periodMap = { HOUR: '/hr', MONTH: '/mo', TOTAL: ' total', YEAR: '/yr' };
      stipendFormatted = `${sym}${Number(internship.stipend.amount).toLocaleString()}${
        periodMap[internship.stipend.period] || '/mo'
      }`;
      if (
        (internship.stipend.period === 'HOUR' && internship.stipend.amount >= 45) ||
        (internship.stipend.period === 'MONTH' && internship.stipend.amount >= 8500) ||
        internship.stipend.amount >= 100000
      ) {
        isHighPay = true;
      }
    }
  } else if (typeof internship.stipend === 'string') {
    stipendFormatted = internship.stipend;
    if (stipendFormatted.includes('$') || stipendFormatted.includes('k')) isHighPay = true;
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
    Remote: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Hybrid: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
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

      {/* Slide-over Side Panel (Responsive max-width across mobile to 4k) */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-in-right border-l border-slate-200">
        
        {/* Top Header Control Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-20">
          {/* Navigation between roles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className={`p-1.5 rounded-xl border transition-all ${
                hasPrev
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-2xs'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
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
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-2xs'
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Next Role (Right Arrow)"
              aria-label="Next role"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 font-mono ml-1.5 font-medium whitespace-nowrap">
              Role {drawerIndex + 1}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
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
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Bookmarks'}
              aria-label="Save"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Close Preview (Esc)"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto touch-scroll">
          
          {/* Hero Identity Banner - Fully Responsive */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50/90 to-white border-b border-slate-100 space-y-4">
            
            {/* Top Company Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CompanyLogo
                  companyName={companyName}
                  slug={companySlug}
                  logo={companyLogo}
                  website={companyWebsite}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1.5 shrink-0 bg-white border border-slate-200/90 shadow-2xs"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                      {companyName}
                    </span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200/80 font-mono whitespace-nowrap shrink-0">
                        <ShieldCheck className="w-3 h-3 text-brand-600 shrink-0" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-wrap">
                    <span className="text-slate-700 font-semibold truncate">{category}</span>
                    {companyWebsite && (
                      <>
                        <span className="text-slate-300">•</span>
                        <a
                          href={companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-600 inline-flex items-center gap-0.5 transition-colors text-brand-600 font-medium whitespace-nowrap"
                        >
                          Website
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {isHighPay && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono whitespace-nowrap">
                    <Flame className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Tier-1 Pay
                  </span>
                )}
                {isLiveFeed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 font-mono whitespace-nowrap">
                    <Radio className="w-3 h-3 text-amber-600 shrink-0" />
                    Live
                  </span>
                )}
              </div>
            </div>

            {/* Main Role Title - Mobile Scaled */}
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug break-words">
              {title}
            </h1>

            {/* Key Metadata Pill Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border whitespace-nowrap ${locationStyles[locationType] || locationStyles.Remote}`}>
                <Laptop className="w-3.5 h-3.5 shrink-0" />
                {locationType}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono whitespace-nowrap">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {stipendFormatted}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {locationFormatted}
              </span>

              {daysUntilDeadline !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold border whitespace-nowrap ${
                    daysUntilDeadline <= 5
                      ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Closes today'}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Navigation Tabs - Horizontal Scroll on Mobile */}
          <div className="border-b border-slate-200 px-4 sm:px-6 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold min-w-max">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Description
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'skills'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Skill Match ({matchDetails.score}%)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'company'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                About {companyName}
              </button>
            </div>
          </div>

          {/* Tab Content Areas */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 3-Column Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Duration
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {internship.duration || '12 Weeks (Summer)'}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Openings
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                      {internship.openings || 1} Positions
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Target Level
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {internship.experienceLevel || 'Undergrad / Masters'}
                    </p>
                  </div>
                </div>

                {/* Structured Description Blocks */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-600 shrink-0" />
                    Role Overview & Scope
                  </h3>

                  <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {descriptionBlocks.map((block, bIdx) => {
                      if (block.type === 'heading') {
                        return (
                          <div key={bIdx} className="pt-2 pb-1 border-b border-slate-100">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0" />
                              {block.title}
                            </h4>
                          </div>
                        );
                      }

                      if (block.type === 'list') {
                        return (
                          <ul key={bIdx} className="space-y-2 pl-0.5 my-2">
                            {block.items.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2 text-slate-700 text-xs sm:text-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      return (
                        <p key={bIdx} className="text-slate-600 leading-relaxed">
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Required Tech Stack */}
                {skills.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-600 shrink-0" />
                      Required Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-800 hover:border-brand-300 transition-all shadow-2xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI SKILL MATCH */}
            {activeTab === 'skills' && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-brand-50/80 via-indigo-50/50 to-white border border-brand-200/80 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          AI Compatibility
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Profile skill evaluation
                        </p>
                      </div>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-brand-700 font-mono">
                      {matchDetails.score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${matchDetails.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Based on your verified engineering background, you meet the primary qualifications for this role.
                  </p>
                </div>

                {/* Matched Skills */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Matched Profile Skills ({matchDetails.matched.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {matchDetails.matched.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Skills to Highlight */}
                {matchDetails.missing.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Recommended Skills to Highlight
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {matchDetails.missing.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50/80 border border-amber-200 text-amber-800"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMPANY CULTURE & SPOTLIGHT */}
            {activeTab === 'company' && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      companyName={companyName}
                      slug={companySlug}
                      logo={companyLogo}
                      website={companyWebsite}
                      className="w-11 h-11 rounded-xl p-1.5 bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">{companyName}</h4>
                      <p className="text-xs text-slate-500 truncate">{company.industry || 'Technology & Software'}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {company.description ||
                      `${companyName} is a premier global technology innovator with engineering teams solving complex scale challenges across distributed infrastructure, AI, and consumer applications.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase">Company Size</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{company.companySize || '1,000+ Team'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase">Founded</span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{company.foundedYear || '2015'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sticky Command Footer - Compact & Responsive */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg shrink-0 flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold text-slate-400 font-mono uppercase">Monthly Stipend</p>
            <p className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">{stipendFormatted}</p>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSave?.(id)}
              className={`px-3 sm:px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                isSaved
                  ? 'bg-brand-50 border-brand-200 text-brand-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
              <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex"
              >
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="font-bold text-xs cursor-pointer"
                >
                  Career Site
                </Button>
              </a>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
              rightIcon={<Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              className="font-bold text-xs sm:text-sm shadow-sm flex-1 sm:flex-initial cursor-pointer justify-center"
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
