import React from 'react';
import CompanyLogo from '../../../components/common/CompanyLogo.jsx';
import { Button } from '../../../components/ui/index.js';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

export function CompanyComparisonDock({
  selectedCompanies = [],
  onRemoveCompany,
  onClearAll,
  onOpenComparisonModal,
}) {
  if (selectedCompanies.length === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-4 max-w-4xl mx-auto z-40 animate-slide-up">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Mini Logos */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-glow-brand">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                Compare Employers ({selectedCompanies.length}/4)
              </p>
              <p className="text-2xs text-slate-400 hidden sm:block">
                Side-by-side stipend, culture, and interview benchmark
              </p>
            </div>
          </div>

          {/* Selected Company Mini Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {selectedCompanies.map((c) => (
              <div
                key={c.slug || c.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold text-slate-200 shrink-0"
              >
                <CompanyLogo
                  companyName={c.name}
                  slug={c.slug}
                  logo={c.logo}
                  website={c.website}
                  className="w-5 h-5 rounded-md"
                />
                <span className="truncate max-w-[80px] text-2xs">{c.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCompany(c)}
                  className="p-0.5 text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label={`Remove ${c.name} from comparison`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Clear
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenComparisonModal}
            className="text-xs px-4 py-1.5 rounded-xl shadow-glow-brand"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Compare Matrix ({selectedCompanies.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CompanyComparisonDock;
