import { type ReactNode } from 'react';

interface KometaHeaderProps {
  brand: ReactNode;
  navLinks: Array<{ href: string; label: string; active?: boolean }>;
  actions?: ReactNode;
  className?: string;
}

export function KometaHeader({
  brand,
  navLinks,
  actions,
  className = '',
}: KometaHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between min-h-[4.75rem] px-4 md:px-8 border-b border-hairline bg-[color-mix(in_oklch,var(--color-bg)_85%,transparent)] backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-6">
        {brand}
      </div>

      <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm text-text-muted">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`transition-colors duration-150 hover:text-text focus-visible:text-text ${
              link.active ? 'text-text font-semibold' : ''
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  );
}
