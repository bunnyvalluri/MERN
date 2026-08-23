import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../components/ui/index.js';
import { CheckCircle2, Circle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';


export function ProfileCompletionCard({ completion, onActionClick: _onActionClick }) {
  const { percentage = 0, breakdown = {}, nextSteps = [] } = completion || {};

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'from-emerald-600 to-teal-500';
    if (pct >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-brand-600 to-indigo-600';
  };

  const sections = [
    { key: 'basicInfo', label: 'Basic Information', weight: '20%' },
    { key: 'education', label: 'Education History', weight: '20%' },
    { key: 'skills', label: 'Key Skills (3+)', weight: '20%' },
    { key: 'experience', label: 'Work Experience', weight: '15%' },
    { key: 'projects', label: 'Projects & Portfolio', weight: '15%' },
    { key: 'resume', label: 'Verified Resume', weight: '10%' },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-900">Profile Strength</CardTitle>
          </div>
          <span className="text-base font-bold font-mono text-brand-600">
            {percentage}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
                percentage
              )} transition-all duration-700`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {percentage === 100
              ? '🎉 Outstanding! Your profile is 100% complete and highly visible to recruiters.'
              : percentage >= 70
              ? 'Great progress! Complete the remaining items to boost application response rates.'
              : 'Complete your profile to unlock verified recruiter visibility and 1-click applications.'}
          </p>
        </div>

        {/* Section Checklist */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {sections.map((sec) => {
            const item = breakdown[sec.key];
            const isCompleted = item?.completed;

            return (
              <div
                key={sec.key}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-1.5 transition-colors ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate font-medium">{sec.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{sec.weight}</span>
              </div>
            );
          })}
        </div>

        {/* Next Action Items */}
        {nextSteps.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-brand-600" />
              Recommended Next Steps:
            </span>
            <div className="space-y-1.5">
              {nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-700 flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="truncate">• {step}</span>
                  <Link
                    to="/student/profile"
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 ml-2 shrink-0 flex items-center gap-1"
                  >
                    Add <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileCompletionCard;
