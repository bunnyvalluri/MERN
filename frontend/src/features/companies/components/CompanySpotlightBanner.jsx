import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Badge, Button } from '../../../components/ui/index.js';
import {
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  Building2,
} from 'lucide-react';

export function CompanySpotlightBanner({
  spotlightCompanies = [],
  onSelectCompany: _onSelectCompany,
}) {
  const [activeTab, setActiveTab] = useState('ALL');

  if (!spotlightCompanies || spotlightCompanies.length === 0) return null;

  const filteredSpotlights = spotlightCompanies.filter((c) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'AI') return c.category === 'AI & Machine Learning';
    if (activeTab === 'QUANT') return c.category === 'FinTech & Quant';
    if (activeTab === 'DEVTOOLS') return c.category === 'Developer Tools' || c.category === 'Cloud & Infrastructure';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Featured Employer Spotlights
            </h2>
            <p className="text-xs text-slate-500">
              Tier-1 engineering cultures actively recruiting Summer & Fall 2026 interns
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Spotlights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AI')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'AI'
                ? 'bg-white text-brand-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤖 Frontier AI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QUANT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'QUANT'
                ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📈 Quant & FinTech
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEVTOOLS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'DEVTOOLS'
                ? 'bg-white text-purple-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛠️ Cloud & DevTools
          </button>
        </div>
      </div>

      {/* Grid of Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpotlights.slice(0, 6).map((company) => {
          const maxStipend = company.compensation?.maxMonthlyStipend || company.compensation?.avgMonthlyStipend;
          return (
            <div
              key={company.slug || company.id}
              className="group bg-gradient-to-b from-white to-slate-50/60 rounded-2xl border border-slate-200/90 hover:border-brand-300 p-5 shadow-xs hover:shadow-card-elevated transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      companyName={company.name}
                      slug={company.slug}
                      logo={company.logo}
                      website={company.website}
                      className="w-12 h-12 shadow-2xs rounded-xl"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/companies/${company.slug}`}
                          className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors"
                        >
                          {company.name}
                        </Link>
                        {company.verified && (
                          <ShieldCheck className="w-4 h-4 fill-brand-50 text-brand-600" />
                        )}
                      </div>
                      <span className="text-2xs font-semibold text-slate-500 block">
                        {company.category}
                      </span>
                    </div>
                  </div>

                  {company.openRolesCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {company.openRolesCount} Open
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.tagline || company.description}
                </p>

                {/* Key Badges */}
                <div className="flex items-center gap-3 text-2xs text-slate-600 pt-1">
                  <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {maxStipend ? `$${(maxStipend / 1000).toFixed(1)}k/mo` : 'Competitive'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {company.ratings?.overall || 4.8}
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {company.ratings?.returnOfferRate || 88}% RO
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs font-mono text-slate-400">
                  {company.location?.city ? `${company.location.city}, ${company.location.state || company.location.country}` : 'Global'}
                </span>

                <Link
                  to={`/companies/${company.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Explore Company</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompanySpotlightBanner;
