'use client';

import { useState, type ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  content: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
}

interface PrelineAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function PrelineAccordion({
  items,
  allowMultiple = false,
  className = '',
}: PrelineAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (item.defaultOpen) initial.add(item.id);
    }
    return initial;
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`divide-y divide-border border border-border bg-surface rounded-md ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);

        return (
          <div key={item.id} className="transition-colors duration-150">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors duration-150 hover:bg-surface-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-display text-base font-semibold text-text">
                    {item.title}
                  </span>
                  {item.badge}
                </div>
                {item.subtitle && (
                  <p className="text-xs text-text-muted font-body">
                    {item.subtitle}
                  </p>
                )}
              </div>

              <span
                className={`font-mono text-sm text-text-muted transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-pink' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="p-4 sm:p-5 pt-0 text-sm font-body text-text-muted border-t border-hairline bg-surface-2">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
