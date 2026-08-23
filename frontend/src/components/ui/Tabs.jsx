import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

/**
 * Accessible SaaS Tabs Component Suite.
 */
export function Tabs({
  defaultValue,
  value: controlledValue,
  onChange,
  variant = 'line',
  className = '',
  children,
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const currentTab = isControlled ? controlledValue : activeTab;

  const handleTabChange = (tabId) => {
    if (!isControlled) {
      setActiveTab(tabId);
    }
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <TabsContext.Provider value={{ currentTab, handleTabChange, variant }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ className = '', children, ...props }) {
  const { variant } = useContext(TabsContext);

  const variantClasses = {
    line: 'border-b border-slate-200 gap-6',
    pills: 'bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1.5 inline-flex',
  };

  return (
    <div
      role="tablist"
      className={`flex items-center overflow-x-auto no-scrollbar select-none ${
        variantClasses[variant] || variantClasses.line
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabTrigger({
  value,
  icon,
  badge,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const { currentTab, handleTabChange, variant } = useContext(TabsContext);
  const isActive = currentTab === value;

  const lineStyles = isActive
    ? 'border-b-2 border-brand-600 text-brand-600 font-semibold pb-3 pt-1 -mb-[1px]'
    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 font-medium pb-3 pt-1 -mb-[1px]';

  const pillStyles = isActive
    ? 'bg-white text-slate-900 font-semibold rounded-lg shadow-sm border border-slate-200/50'
    : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-200/60 rounded-lg';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => handleTabChange(value)}
      className={`inline-flex items-center gap-2 text-xs sm:text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        variant === 'pills' ? `px-3.5 py-1.5 ${pillStyles}` : lineStyles
      } ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
            isActive
              ? variant === 'pills'
                ? 'bg-brand-50 text-brand-700'
                : 'bg-brand-50 text-brand-700'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function TabContent({ value, className = '', children, ...props }) {
  const { currentTab } = useContext(TabsContext);

  if (currentTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={`pt-5 animate-fade-in focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tabs;
