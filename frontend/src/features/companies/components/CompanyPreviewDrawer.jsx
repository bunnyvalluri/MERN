import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Button, Badge } from '../../../components/ui/index.js';
import {
  X,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Star,
  DollarSign,
  Briefcase,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Globe2,
  Calendar,
  Send,
  Bookmark,
} from 'lucide-react';

export function CompanyPreviewDrawer({
  isOpen,
  onClose,
  company,
  onApplyRole,
  onToggleSaveJob,
  savedJobIds = new Set(),
}) {
  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !company) return null;

  const maxStipend = company.compensation?.maxMonthlyStipend || company.compensation?.avgMonthlyStipend;
  const rating = company.ratings?.overall || 4.8;
  const openRoles = company.activeInternships || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-up sm:animate-none">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <CompanyLogo
                companyName={company.name}
                slug={company.slug}
                logo={company.logo}
                website={company.website}
                className="w-14 h-14 rounded-2xl shadow-xs shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xl font-extrabold text-slate-900 truncate">
                    {company.name}
                  </h2>
                  {company.verified && (
                    <span title="Verified Employer" className="inline-flex items-center text-brand-600">
                      <ShieldCheck className="w-5 h-5 fill-brand-50" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-semibold text-slate-700">{company.category}</span>
                  <span>•</span>
                  <span>{company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'Global HQ'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Key Metrics Banner */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <div>
                <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Top Stipend
                </span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                  {maxStipend ? `$${(maxStipend / 1000).toFixed(1)}k/mo` : 'Competitive'}
                </span>
              </div>
              <div>
                <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Intern Rating
                </span>
                <span className="text-sm font-extrabold text-slate-900 inline-flex items-center justify-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {rating} / 5.0
                </span>
              </div>
              <div>
                <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Return Offer
                </span>
                <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
                  {company.ratings?.returnOfferRate || 88}%
                </span>
              </div>
            </div>

            {/* About & Engineering Philosophy */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About & Engineering Mission
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {company.description}
              </p>
              {company.engineeringPhilosophy && (
                <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 text-xs text-brand-900 font-medium leading-relaxed">
                  <strong className="font-bold block text-brand-950 mb-0.5">Engineering Philosophy:</strong>
                  {company.engineeringPhilosophy}
                </div>
              )}
            </div>

            {/* Core Tech Stack */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Tech Stack & Architecture
              </h3>
              <div className="flex items-center flex-wrap gap-1.5">
                {(company.techStack || ['Python', 'React', 'Go', 'Kubernetes']).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-medium border border-slate-200/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Perks & Benefits Highlights */}
            {company.perks && company.perks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Intern Perks & Support
                </h3>
                <ul className="space-y-1.5">
                  {company.perks.slice(0, 4).map((perk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Open Internships (Direct Apply) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Open Internships ({openRoles.length})
                </h3>
                {openRoles.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Accepting Applications
                  </span>
                )}
              </div>

              {openRoles.length > 0 ? (
                <div className="space-y-2.5">
                  {openRoles.map((role) => {
                    const isJobSaved = savedJobIds.has(role._id || role.id);
                    return (
                      <div
                        key={role._id || role.id}
                        className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-brand-300 transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/internships/${role._id || role.id}`}
                              onClick={onClose}
                              className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                            >
                              {role.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {role.remote || 'Remote'} • {role.type || 'Full-Time'} • {role.duration || 'Summer 2026'}
                            </p>
                          </div>

                          <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                            {role.stipend?.amount ? `$${role.stipend.amount.toLocaleString()}/mo` : 'Competitive'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(role.skills || []).slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-2xs font-mono"
                              >
                                {s}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onToggleSaveJob && onToggleSaveJob(role)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isJobSaved
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                              }`}
                              title={isJobSaved ? 'Saved' : 'Save opportunity'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isJobSaved ? 'fill-amber-500' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onApplyRole && onApplyRole(role);
                              }}
                              className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    No active listings currently published
                  </p>
                  <p className="text-2xs text-slate-500">
                    You can still explore the full company profile and join the talent pool for future openings.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Official Website
              </a>
            )}

            <Link to={`/companies/${company.slug}`} onClick={onClose}>
              <Button
                variant="primary"
                size="md"
                className="text-xs px-4"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Full Company Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyPreviewDrawer;
