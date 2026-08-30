import { type ReactNode } from 'react';

interface FooterColumn {
  title: string;
  links: Array<{ href: string; label: string; external?: boolean }>;
}

interface KometaFooterProps {
  brand: ReactNode;
  tagline?: string;
  columns: FooterColumn[];
  legalNotice?: string;
  statusBadge?: ReactNode;
  className?: string;
}

export function KometaFooter({
  brand,
  tagline,
  columns,
  legalNotice,
  statusBadge,
  className = '',
}: KometaFooterProps) {
  return (
    <footer className={`border-t border-border bg-surface-2 py-12 md:py-16 text-text-muted ${className}`}>
      <div className="shell grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            {brand}
          </div>
          {tagline && (
            <p className="max-w-sm text-sm text-text-muted font-body">
              {tagline}
            </p>
          )}
          {statusBadge && (
            <div className="pt-2">
              {statusBadge}
            </div>
          )}
        </div>

        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-text font-semibold">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer noopener' : undefined}
                      className="transition-colors duration-150 hover:text-text focus-visible:text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {legalNotice && (
        <div className="shell mt-12 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-text-faint font-mono">
          <p>{legalNotice}</p>
          <p className="mt-2 sm:mt-0">All systems nominal</p>
        </div>
      )}
    </footer>
  );
}
