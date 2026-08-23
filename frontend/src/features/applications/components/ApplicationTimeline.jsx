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
  APPLIED: <Send className="w-4 h-4 text-blue-400" />,
  UNDER_REVIEW: <Eye className="w-4 h-4 text-purple-400" />,
  SHORTLISTED: <Sparkles className="w-4 h-4 text-amber-400" />,
  INTERVIEW: <Calendar className="w-4 h-4 text-teal-400" />,
  SELECTED: <UserCheck className="w-4 h-4 text-emerald-400" />,
  REJECTED: <XCircle className="w-4 h-4 text-red-400" />,
  WITHDRAWN: <AlertCircle className="w-4 h-4 text-slate-400" />,
};

const STATUS_COLORS = {
  APPLIED: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  UNDER_REVIEW: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  SHORTLISTED: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  INTERVIEW: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  SELECTED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  REJECTED: 'border-red-500/30 bg-red-500/10 text-red-400',
  WITHDRAWN: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
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
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {sortedTimeline.map((event, index) => {
        const isLatest = index === sortedTimeline.length - 1;
        const status = event.status || 'APPLIED';
        const icon = STATUS_ICONS[status] || <Clock className="w-4 h-4 text-brand-400" />;
        const colorClass = STATUS_COLORS[status] || 'border-slate-700 bg-slate-800 text-slate-300';
        const badgeVariant = STATUS_BADGE_VARIANTS[status] || 'neutral';

        return (
          <div key={event._id || index} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                isLatest ? `${colorClass} ring-2 ring-brand-500/40 ring-offset-2 ring-offset-slate-950` : colorClass
              }`}
            >
              {icon}
            </div>

            {/* Event Content */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 transition-colors group-hover:border-slate-700 space-y-1.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant} size="sm">
                    {status.replace('_', ' ')}
                  </Badge>
                  {isLatest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                      Current Stage
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
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
                <p className="text-xs sm:text-sm text-slate-300 pt-1 leading-relaxed">
                  {event.note}
                </p>
              )}

              {/* Changed By Actor info if provided */}
              {event.changedBy && typeof event.changedBy === 'object' && event.changedBy.name && (
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Updated by: <strong className="text-slate-400">{event.changedBy.name}</strong>{' '}
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
