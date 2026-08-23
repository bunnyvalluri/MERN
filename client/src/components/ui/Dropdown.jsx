import React, { useState, useRef, useEffect } from 'react';

/**
 * Accessible SaaS Action Dropdown Menu.
 */
export function Dropdown({
  trigger,
  align = 'right',
  className = '',
  menuClassName = '',
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute mt-2 min-w-[12rem] bg-slate-900 border border-slate-800 rounded-xl shadow-dropdown py-1.5 z-40 focus:outline-none animate-scale-in ${
            alignmentClasses[align] || alignmentClasses.right
          } ${menuClassName}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  icon,
  danger = false,
  disabled = false,
  shortcut,
  onClick,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors select-none text-left disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? 'text-danger-400 hover:bg-danger-500/10 hover:text-danger-300'
          : 'text-slate-200 hover:bg-slate-800 hover:text-slate-100'
      } ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <span className="truncate">{children}</span>
      </div>
      {shortcut && (
        <span className="text-[11px] text-slate-500 font-mono ml-3">{shortcut}</span>
      )}
    </button>
  );
}

export function DropdownDivider({ className = '' }) {
  return <div className={`my-1 border-t border-slate-800 ${className}`} role="separator" />;
}

export function DropdownHeader({ className = '', children }) {
  return (
    <div
      className={`px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase select-none ${className}`}
    >
      {children}
    </div>
  );
}

export default Dropdown;
