import { type ReactNode } from 'react';

export interface FeatureItem {
  id?: string;
  number?: string;
  signalColor?: 'pink' | 'cyan' | 'lime' | 'amber' | 'red';
  title: string;
  description: string;
  items?: string[];
  actionLabel?: string;
  actionHref?: string;
}

interface KometaFeaturesGridProps {
  kicker?: string;
  title?: ReactNode;
  intro?: ReactNode;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KometaFeaturesGrid({
  kicker,
  title,
  intro,
  features,
  columns = 2,
  className = '',
}: KometaFeaturesGridProps) {
  const colClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const signalColorClasses = {
    pink: 'bg-pink shadow-[0_0_0.75rem_var(--color-pink)]',
    cyan: 'bg-cyan shadow-[0_0_0.75rem_var(--color-cyan)]',
    lime: 'bg-lime shadow-[0_0_0.75rem_var(--color-lime)]',
    amber: 'bg-amber shadow-[0_0_0.75rem_var(--color-amber)]',
    red: 'bg-red shadow-[0_0_0.75rem_var(--color-red)]',
  };

  return (
    <section className={`py-12 md:py-16 ${className}`}>
      {(kicker || title || intro) && (
        <div className="mb-8 md:mb-12 space-y-3">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-text">
              {title}
            </h2>
          )}
          {intro && (
            <div className="text-sm sm:text-base text-text-muted max-w-2xl font-body">
              {intro}
            </div>
          )}
        </div>
      )}

      <div className={`grid ${colClass} border-t border-l border-border bg-surface-2`}>
        {features.map((item, idx) => (
          <div
            key={item.id ?? item.title ?? idx}
            className="p-6 md:p-8 border-r border-b border-border flex flex-col justify-between min-h-[14rem] transition-colors duration-200 hover:bg-surface-3"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                {item.number && (
                  <span className="font-mono text-xs text-text-faint">
                    {item.number}
                  </span>
                )}
                {item.signalColor && (
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      signalColorClasses[item.signalColor]
                    }`}
                  />
                )}
              </div>

              <h3 className="font-display text-xl font-semibold text-text tracking-tight mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-text-muted font-body leading-relaxed">
                {item.description}
              </p>

              {item.items && item.items.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs font-mono text-text-faint">
                  {item.items.map((sub, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-pink">/</span>
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {item.actionHref && (
              <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
                <a
                  href={item.actionHref}
                  className="inline-flex items-center gap-2 text-xs font-mono text-cyan hover:underline"
                >
                  <span>{item.actionLabel ?? 'Explore'}</span>
                  <span>→</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
