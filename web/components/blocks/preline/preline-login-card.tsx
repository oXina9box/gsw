import { type ReactNode } from 'react';

interface PrelineLoginCardProps {
  title?: ReactNode;
  kicker?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  brand?: ReactNode;
  className?: string;
}

export function PrelineLoginCard({
  title,
  kicker,
  subtitle,
  children,
  footer,
  brand,
  className = '',
}: PrelineLoginCardProps) {
  return (
    <div className={`w-full max-w-md mx-auto p-6 sm:p-8 border border-border bg-surface rounded-md shadow-2xl ${className}`}>
      {(brand || kicker || title || subtitle) && (
        <div className="text-center mb-6 space-y-2">
          {brand && <div className="flex justify-center mb-4">{brand}</div>}
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
              {title}
            </h1>
          )}
          {subtitle && (
            <div className="text-sm text-text-muted font-body">
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>

      {footer && (
        <div className="mt-6 pt-4 border-t border-border text-center text-xs font-body text-text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}
