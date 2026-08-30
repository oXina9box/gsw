import { type ReactNode } from 'react';

interface PrelineCardProps {
  title?: ReactNode;
  kicker?: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function PrelineCard({
  title,
  kicker,
  subtitle,
  action,
  badge,
  children,
  footer,
  className = '',
}: PrelineCardProps) {
  return (
    <div className={`border border-border bg-surface rounded-md flex flex-col justify-between overflow-hidden ${className}`}>
      {(title || kicker || subtitle || action || badge) && (
        <div className="p-4 sm:p-5 border-b border-border bg-surface-2 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {kicker && (
              <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
                {kicker}
              </p>
            )}
            {title && (
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-text">
                  {title}
                </h3>
                {badge}
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted font-body">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 space-y-4 font-body">
        {children}
      </div>

      {footer && (
        <div className="p-4 sm:p-5 border-t border-border bg-surface-2 text-xs font-mono text-text-faint flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
