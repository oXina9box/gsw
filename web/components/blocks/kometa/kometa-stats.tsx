import { type ReactNode } from 'react';

export interface StatItem {
  id?: string;
  value: string;
  label: string;
  subtext?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface KometaStatsProps {
  kicker?: string;
  title?: ReactNode;
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KometaStats({
  kicker,
  title,
  stats,
  columns = 4,
  className = '',
}: KometaStatsProps) {
  const colClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section className={`py-8 md:py-12 ${className}`}>
      {(kicker || title) && (
        <div className="mb-6 md:mb-8 space-y-2">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-text">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className={`grid ${colClass} border-t border-l border-border bg-surface`}>
        {stats.map((stat, idx) => (
          <div
            key={stat.id ?? idx}
            className="p-6 border-r border-b border-border flex flex-col justify-between"
          >
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">
              {stat.label}
            </span>

            <div className="flex items-baseline gap-2 my-1">
              <span className="font-display text-3xl sm:text-4xl font-bold text-text tabular-nums">
                {stat.value}
              </span>
              {stat.change && (
                <span
                  className={`font-mono text-xs font-semibold ${
                    stat.changeType === 'positive'
                      ? 'text-lime'
                      : stat.changeType === 'negative'
                        ? 'text-red'
                        : 'text-text-muted'
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>

            {stat.subtext && (
              <span className="text-xs text-text-faint font-body mt-2">
                {stat.subtext}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
