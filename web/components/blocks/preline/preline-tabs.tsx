'use client';

import { type ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  count?: number | string;
  icon?: ReactNode;
}

interface PrelineTabsProps {
  tabs: TabItem[];
  variant?: 'underline' | 'pill' | 'segmented';
  onSelect?: (id: string) => void;
  className?: string;
}

export function PrelineTabs({
  tabs,
  variant = 'underline',
  onSelect,
  className = '',
}: PrelineTabsProps) {
  if (variant === 'pill') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {tabs.map((tab) => {
          const activeClass = tab.active
            ? 'bg-surface-3 text-text border-cyan'
            : 'bg-transparent text-text-muted hover:text-text hover:bg-surface-2 border-transparent';

          return tab.href ? (
            <a
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-150 ${activeClass}`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-bg text-text-faint">
                  {tab.count}
                </span>
              )}
            </a>
          ) : (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect?.(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-150 ${activeClass}`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-bg text-text-faint">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 sm:gap-6 border-b border-border overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const activeClass = tab.active
          ? 'border-b-2 border-pink text-text font-semibold'
          : 'border-b-2 border-transparent text-text-muted hover:text-text';

        return tab.href ? (
          <a
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 py-3 text-sm font-body whitespace-nowrap transition-colors duration-150 ${activeClass}`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="font-mono text-xs text-text-faint">
                ({tab.count})
              </span>
            )}
          </a>
        ) : (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect?.(tab.id)}
            className={`flex items-center gap-2 py-3 text-sm font-body whitespace-nowrap transition-colors duration-150 ${activeClass}`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="font-mono text-xs text-text-faint">
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
