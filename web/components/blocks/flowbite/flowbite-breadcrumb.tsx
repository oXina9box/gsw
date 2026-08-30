import { type ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface FlowbiteBreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function FlowbiteBreadcrumb({
  items,
  homeHref = '/',
  homeLabel = 'Home',
  icon,
  className = '',
}: FlowbiteBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-mono ${className}`}>
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <li className="inline-flex items-center">
          <a
            href={homeHref}
            className="inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors duration-150"
          >
            {icon && <span>{icon}</span>}
            <span>{homeLabel}</span>
          </a>
        </li>

        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-text-faint font-semibold">/</span>
            {item.current || !item.href ? (
              <span className="text-text font-semibold truncate max-w-[12rem] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-text-muted hover:text-text transition-colors duration-150 truncate max-w-[10rem] sm:max-w-xs"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
