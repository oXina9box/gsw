import { type ReactNode } from 'react';

export interface TimelineItem {
  id?: string;
  title: ReactNode;
  time?: string;
  description?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  status?: 'active' | 'completed' | 'pending' | 'failed';
}

interface FlowbiteTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function FlowbiteTimeline({
  items,
  className = '',
}: FlowbiteTimelineProps) {
  const statusColors = {
    active: 'bg-cyan border-cyan text-cyan shadow-[0_0_0.5rem_var(--color-cyan)]',
    completed: 'bg-lime border-lime text-lime shadow-[0_0_0.5rem_var(--color-lime)]',
    pending: 'bg-surface-3 border-border text-text-faint',
    failed: 'bg-red border-red text-red shadow-[0_0_0.5rem_var(--color-red)]',
  };

  return (
    <ol className={`relative border-l border-border ml-3 space-y-6 ${className}`}>
      {items.map((item, idx) => {
        const dotStyle = item.status
          ? statusColors[item.status]
          : 'bg-surface-3 border-border text-text-faint';

        return (
          <li key={item.id ?? idx} className="ml-6">
            <span
              className={`absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full border-2 bg-surface text-[10px] ${dotStyle}`}
            >
              {item.icon ?? (item.status === 'completed' ? '✓' : '•')}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="font-display text-sm sm:text-base font-semibold text-text">
                  {item.title}
                </h4>
                {item.badge}
              </div>

              {item.time && (
                <time className="block font-mono text-xs text-text-faint">
                  {item.time}
                </time>
              )}

              {item.description && (
                <div className="text-xs sm:text-sm font-body text-text-muted mt-1 leading-relaxed">
                  {item.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
