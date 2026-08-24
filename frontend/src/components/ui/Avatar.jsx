import React, { useState } from 'react';

/**
 * Premium SaaS Avatar Component with Fallback Initials & Status Indicator.
 */
export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
}) {
  const [imageError, setImageError] = useState(false);

  // Compute clean initials from name (filter out numbers and special characters)
  const getInitials = (n) => {
    if (!n) return '';
    const cleanLetters = n.replace(/[^a-zA-Z\s]/g, '').trim();
    if (!cleanLetters) return n.trim().slice(0, 2).toUpperCase();
    const parts = cleanLetters.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Generate deterministic modern gradient based on name hash
  const getGradientByName = (n) => {
    if (!n) return 'from-brand-600 via-indigo-600 to-brand-700';
    const charCodeSum = n.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-brand-600 via-indigo-600 to-brand-700',
      'from-indigo-600 via-violet-600 to-indigo-700',
      'from-blue-600 via-indigo-600 to-cyan-700',
      'from-teal-600 via-emerald-600 to-teal-700',
      'from-violet-600 via-purple-600 to-indigo-700',
      'from-slate-700 via-slate-800 to-slate-900',
    ];
    return gradients[charCodeSum % gradients.length];
  };

  const sizeClasses = {
    xs: 'w-6 h-6 min-w-6 min-h-6 text-[10px]',
    sm: 'w-8 h-8 min-w-8 min-h-8 text-xs',
    md: 'w-10 h-10 min-w-10 min-h-10 text-sm',
    lg: 'w-12 h-12 min-w-12 min-h-12 text-base',
    xl: 'w-16 h-16 min-w-16 min-h-16 text-xl',
    '2xl': 'w-20 h-20 min-w-20 min-h-20 text-2xl',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-4 h-4 ring-2',
    '2xl': 'w-5 h-5 ring-3',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  const initials = getInitials(name || alt);
  const showFallback = !src || imageError;

  return (
    <div
      className={`relative shrink-0 select-none rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white shadow-2xs border border-slate-200/80 ${
        sizeClasses[size] || sizeClasses.md
      } ${
        showFallback
          ? `bg-gradient-to-tr ${getGradientByName(name || alt)}`
          : 'bg-slate-100'
      } ${className}`}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover block rounded-2xl"
        />
      ) : (
        <span className="tracking-wider">{initials || 'ST'}</span>
      )}

      {status && statusColors[status] && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${
            statusDotSizes[size] || statusDotSizes.md
          } ${statusColors[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

/**
 * Avatar Group for stacked user lists.
 */
export function AvatarGroup({ max = 4, size = 'md', className = '', children }) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const excess = childrenArray.length - max;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] -ml-1.5',
    sm: 'w-8 h-8 text-xs -ml-2',
    md: 'w-10 h-10 text-sm -ml-2.5',
    lg: 'w-12 h-12 text-base -ml-3',
    xl: 'w-16 h-16 text-xl -ml-4',
    '2xl': 'w-20 h-20 text-2xl -ml-5',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((child, idx) => (
        <div
          key={idx}
          className={`relative ring-2 ring-white rounded-2xl transition-transform hover:scale-110 hover:z-10 ${
            idx > 0 ? sizeClasses[size].split(' ').pop() : ''
          }`}
        >
          {React.cloneElement(child, { size })}
        </div>
      ))}

      {excess > 0 && (
        <div
          className={`relative rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold ring-2 ring-white flex items-center justify-center select-none ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          +{excess}
        </div>
      )}
    </div>
  );
}

export default Avatar;
