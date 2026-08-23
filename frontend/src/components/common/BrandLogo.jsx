import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Official Brand Icon using the custom geometric glowing bolt & 'H' emblem.
 */
export function BrandIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 ${dimension} ${className}`}
    >
      <img
        src="/favicon.svg"
        alt="InternHub Logo"
        className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
      />
    </div>
  );
}

/**
 * Full Brand Logo with Icon and Clean SaaS Typography.
 */
export function BrandLogo({
  size = 'md',
  showBadge = true,
  badgeText = 'Beta',
  to = '/',
  className = '',
  inverted = false,
}) {
  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <BrandIcon size={size} />
      <div className="flex items-center gap-2">
        <span
          className={`font-bold tracking-tight transition-colors ${
            inverted
              ? 'text-white group-hover:text-white/80'
              : 'text-slate-900 group-hover:text-brand-600'
          } ${
            textSizeMap[size] || textSizeMap.md
          }`}
        >
          InternHub
        </span>
        {showBadge && (
          <span
            className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              inverted
                ? 'bg-white/15 text-white border-white/25'
                : 'bg-brand-50 text-brand-700 border-brand-200/80'
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`inline-flex focus-visible:outline-none focus-visible:ring-2 rounded-xl p-0.5 ${
          inverted ? 'focus-visible:ring-white/70' : 'focus-visible:ring-brand-500'
        }`}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
