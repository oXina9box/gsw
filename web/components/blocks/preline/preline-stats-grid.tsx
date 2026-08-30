import { type ReactNode } from 'react';

export interface PrelineStat {
  id?: string;
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

interface PrelineStatsGridProps {
  stats: PrelineStat[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PrelineStatsGrid({
  stats,
  columns = 4,
  className = '',
}: PrelineStatsGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${colClass} gap-4 ${className}`}>
      {stats.map((stat, idx) => (
        <div
          key={stat.id ?? idx}
          className="p-4 sm:p-5 border border-border bg-surface rounded-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-text-faint uppercase tracking-wider">
              {stat.label}
            </span>
            {stat.icon && (
              <span className="text-text-muted text-sm">{stat.icon}</span>
            )}
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="font-display text-2xl sm:text-3xl font-bold text-text tabular-nums">
              {stat.value}
            </span>
            {stat.trend && (
              <span
                className={`font-mono text-xs font-semibold ${
                  stat.trend.isPositive ? 'text-lime' : 'text-red'
                }`}
              >
                {stat.trend.value}
              </span>
            )}
          </div>

          {stat.subtext && (
            <span className="text-xs text-text-muted font-body mt-2">
              {stat.subtext}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
