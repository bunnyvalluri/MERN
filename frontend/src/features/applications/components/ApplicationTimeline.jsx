import React from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  XCircle,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../../components/ui/index.js';

const STATUS_ICONS = {
  APPLIED: <Send className="w-4 h-4 text-blue-600" />,
  UNDER_REVIEW: <Eye className="w-4 h-4 text-indigo-600" />,
  SHORTLISTED: <Sparkles className="w-4 h-4 text-amber-600" />,
  INTERVIEW: <Calendar className="w-4 h-4 text-teal-600" />,
  SELECTED: <UserCheck className="w-4 h-4 text-emerald-600" />,
  REJECTED: <XCircle className="w-4 h-4 text-rose-600" />,
  WITHDRAWN: <AlertCircle className="w-4 h-4 text-slate-500" />,
};

const STATUS_COLORS = {
  APPLIED: 'border-blue-200 bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  SHORTLISTED: 'border-amber-200 bg-amber-50 text-amber-700',
  INTERVIEW: 'border-teal-200 bg-teal-50 text-teal-700',
  SELECTED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
  WITHDRAWN: 'border-slate-200 bg-slate-100 text-slate-600',
};

const STATUS_BADGE_VARIANTS = {
  APPLIED: 'primary',
  UNDER_REVIEW: 'secondary',
  SHORTLISTED: 'warning',
  INTERVIEW: 'info',
  SELECTED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
};

export function ApplicationTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        No timeline events recorded.
      </div>
    );
  }

  // Sort timeline chronologically (latest event at the bottom or top depending on flow; standard UX: earliest at top to latest at bottom)
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sortedTimeline.map((event, index) => {
        const isLatest = index === sortedTimeline.length - 1;
        const status = event.status || 'APPLIED';
        const icon = STATUS_ICONS[status] || <Clock className="w-4 h-4 text-brand-600" />;
        const colorClass = STATUS_COLORS[status] || 'border-slate-200 bg-slate-100 text-slate-700';
        const badgeVariant = STATUS_BADGE_VARIANTS[status] || 'neutral';

        return (
          <div key={event._id || index} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                isLatest ? `${colorClass} ring-2 ring-brand-500/40 ring-offset-2 ring-offset-white` : colorClass
              }`}
            >
              {icon}
            </div>

            {/* Event Content */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 transition-colors group-hover:border-slate-300 space-y-1.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant} size="sm">
                    {status.replace('_', ' ')}
                  </Badge>
                  {isLatest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      Current Stage
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {new Date(event.changedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Event Note */}
              {event.note && (
                <p className="text-xs sm:text-sm text-slate-700 pt-1 leading-relaxed">
                  {event.note}
                </p>
              )}

              {/* Changed By Actor info if provided */}
              {event.changedBy && typeof event.changedBy === 'object' && event.changedBy.name && (
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Updated by: <strong className="text-slate-700">{event.changedBy.name}</strong>{' '}
                  ({event.changedBy.role || 'Staff'})
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ApplicationTimeline;
