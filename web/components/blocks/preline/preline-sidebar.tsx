import { type ReactNode } from 'react';

export interface SidebarSection {
  title: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
    active?: boolean;
    badge?: string;
    icon?: ReactNode;
  }>;
}

interface PrelineSidebarProps {
  sections: SidebarSection[];
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function PrelineSidebar({
  sections,
  header,
  footer,
  className = '',
}: PrelineSidebarProps) {
  return (
    <aside className={`w-full md:w-64 flex flex-col justify-between shrink-0 space-y-6 ${className}`}>
      {header && <div className="pb-4 border-b border-border">{header}</div>}

      <div className="space-y-6 flex-1">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-text-faint font-semibold px-2">
              {sec.title}
            </h3>
            <ul className="space-y-1">
              {sec.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-sm text-sm font-body transition-colors duration-150 ${
                      item.active
                        ? 'bg-surface-3 text-text font-semibold border-l-2 border-cyan'
                        : 'text-text-muted hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 font-mono text-[10px] rounded-full bg-surface-2 text-cyan border border-border">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {footer && <div className="pt-4 border-t border-border">{footer}</div>}
    </aside>
  );
}
