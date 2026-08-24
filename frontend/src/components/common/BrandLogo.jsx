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
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
      >
        <defs>
          {/* Main Body Violet-Blue Gradient */}
          <linearGradient id="brandBoltGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="45%" stopColor="#7C3AED" />
            <stop offset="75%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Upper Facet Highlight */}
          <linearGradient id="facetTopGrad" x1="12" y1="6" x2="28" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
          </linearGradient>

          {/* Lower Right Electric Cyan Glow */}
          <linearGradient id="facetBottomGrad" x1="18" y1="20" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>

          {/* Container Background Soft Shadow */}
          <linearGradient id="bgTileGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Outer Dark Glass Tile Base */}
        <rect width="40" height="40" rx="10" fill="url(#bgTileGrad)" />
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="9.5"
          stroke="url(#brandBoltGrad)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* Geometric Angular Lightning Core (Main Polygon) */}
        <path
          d="M24.5 5.5L11.5 19H19.5L14 34.5L30 17.5H21.5L24.5 5.5Z"
          fill="url(#brandBoltGrad)"
        />

        {/* Top Sharp Facet Highlight */}
        <path
          d="M24.5 5.5L11.5 19H19.5L24.5 5.5Z"
          fill="url(#facetTopGrad)"
        />

        {/* Bottom Trailing Electric Facet */}
        <path
          d="M14 34.5L30 17.5H21.5L18.5 24.5L14 34.5Z"
          fill="url(#facetBottomGrad)"
        />

        {/* Center Dynamic Energy Slit Accent */}
        <path
          d="M17.5 16L13.5 20.5H18L15.5 27L24.5 17.5H19.5L21.5 11.5L17.5 16Z"
          fill="#FFFFFF"
          fillOpacity="0.28"
        />
      </svg>
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
