import { type ReactNode } from 'react';

export type BadgeColor = 'pink' | 'cyan' | 'lime' | 'amber' | 'red' | 'default';

interface FlowbiteBadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function FlowbiteBadge({
  children,
  color = 'default',
  size = 'md',
  dot = false,
  className = '',
}: FlowbiteBadgeProps) {
  const colorStyles: Record<BadgeColor, string> = {
    pink: 'text-pink border-pink/40 bg-pink/10',
    cyan: 'text-cyan border-cyan/40 bg-cyan/10',
    lime: 'text-lime border-lime/40 bg-lime/10',
    amber: 'text-amber border-amber/40 bg-amber/10',
    red: 'text-red border-red/40 bg-red/10',
    default: 'text-text-muted border-border bg-surface-2',
  };

  const dotStyles: Record<BadgeColor, string> = {
    pink: 'bg-pink',
    cyan: 'bg-cyan',
    lime: 'bg-lime',
    amber: 'bg-amber',
    red: 'bg-red',
    default: 'bg-text-muted',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold rounded-full border ${colorStyles[color]} ${sizeClass} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[color]}`} />
      )}
      <span>{children}</span>
    </span>
  );
}
