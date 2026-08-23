import React from 'react';
import { Card, CardContent, Avatar, Badge } from '../ui/index.js';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

/**
 * Reusable Testimonial Card Component.
 */
export function TestimonialCard({
  quote,
  author,
  role,
  affiliation,
  avatar,
  rating = 5,
  verified = true,
  type = 'student',
  className = '',
}) {
  return (
    <Card
      className={`relative flex flex-col justify-between border-slate-200 bg-white shadow-sm p-6 sm:p-7 ${className}`}
    >
      <div className="space-y-4">
        {/* Rating Stars & Type Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-400" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <Badge variant={type === 'student' ? 'primary' : 'success'} size="sm">
            {type === 'student' ? 'Student Success' : 'Recruiter Partner'}
          </Badge>
        </div>

        {/* Quote text */}
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Author Details */}
      <div className="pt-6 border-t border-slate-100 flex items-center gap-3.5 mt-6">
        <Avatar src={avatar} name={author} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{author}</h4>
            {verified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{role}</p>
          <p className="text-[11px] font-medium text-brand-600 truncate">{affiliation}</p>
        </div>
      </div>
    </Card>
  );
}

export default TestimonialCard;
