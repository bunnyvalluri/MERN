import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge, Button } from '../../../components/ui/index.js';

export function CalendarView({
  interviews = [],
  _onSelectInterview,
  isRecruiter = false,
  onReschedule,
  onCancel,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month and total days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map interviews to day buckets in this month
  const interviewsByDay = {};
  interviews.forEach((item) => {
    const d = new Date(item.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!interviewsByDay[dayNum]) interviewsByDay[dayNum] = [];
      interviewsByDay[dayNum].push(item);
    }
  });

  const selectedDayInterviews = interviewsByDay[selectedDay] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-sm">
      {/* Left Column: Calendar Grid */}
      <div className="lg:col-span-7 space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
              {monthName}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold text-slate-500 uppercase py-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="truncate">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-16 rounded-xl bg-slate-50" />
          ))}

          {/* Month Day Slots */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const dayEvents = interviewsByDay[dayNum] || [];
            const hasEvents = dayEvents.length > 0;
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-10 sm:h-16 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col justify-between items-center transition-all relative border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 scale-[1.02]'
                    : isToday
                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                    : hasEvents
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                }`}
              >
                <span className="text-[11px] sm:text-sm font-bold">{dayNum}</span>

                {/* Event indicators */}
                {hasEvents && (
                  <div className="flex items-center gap-0.5 sm:gap-1 justify-center">
                    <span
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-brand-600 ring-2 ring-brand-200'
                      }`}
                    />
                    {dayEvents.length > 1 && (
                      <span
                        className={`text-[8px] sm:text-[9px] font-bold ${
                          isSelected ? 'text-white' : 'text-brand-600'
                        }`}
                      >
                        +{dayEvents.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Day Schedule / Agenda */}
      <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6 space-y-4 flex flex-col">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Schedule for {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay}
            </h3>
            <p className="text-[11px] text-slate-500">
              {selectedDayInterviews.length} interview(s) booked
            </p>
          </div>
          <span className="text-xs font-mono text-brand-600 font-semibold uppercase">
            Agenda
          </span>
        </div>

        {/* Selected Day Event List */}
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] no-scrollbar">
          {selectedDayInterviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No interviews scheduled for this date.</p>
              <p className="text-[11px] text-slate-400">
                Select a highlighted date on the calendar to view agenda details.
              </p>
            </div>
          ) : (
            selectedDayInterviews.map((item) => {
              const itemDate = new Date(item.scheduledAt);
              return (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isRecruiter
                          ? item.studentId?.name || 'Candidate'
                          : item.internshipId?.title || 'Internship Interview'}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {isRecruiter
                          ? item.internshipId?.title
                          : item.companyId?.name || 'Hiring Organization'}
                      </p>
                    </div>

                    <Badge
                      variant={
                        item.status === 'COMPLETED'
                          ? 'success'
                          : item.status === 'CANCELLED'
                          ? 'danger'
                          : item.status === 'RESCHEDULED'
                          ? 'warning'
                          : 'info'
                      }
                      size="xs"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Time & Duration Chip */}
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl w-fit">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      {itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {item.durationMinutes || item.duration || 45} mins
                    </span>
                  </div>

                  {/* Recruiter / Prep Notes */}
                  {item.notes && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                        Preparation Notes
                      </span>
                      <p className="text-xs leading-relaxed">{item.notes}</p>
                    </div>
                  )}

                  {/* Actions (Join Call / Reschedule / Cancel) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    {item.meetingLink || item.meetingUrl ? (
                      <a
                        href={item.meetingLink || item.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={<Video className="w-3.5 h-3.5" />}
                        >
                          Join Call
                        </Button>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No link provided</span>
                    )}

                    {isRecruiter && item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
                      <div className="flex items-center gap-1.5">
                        {onReschedule && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => onReschedule(item)}
                          >
                            Reschedule
                          </Button>
                        )}
                        {onCancel && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onCancel(item)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
