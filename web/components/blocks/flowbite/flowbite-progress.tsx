interface FlowbiteProgressProps {
  progress: number;
  label?: string;
  showValue?: boolean;
  color?: 'pink' | 'cyan' | 'lime' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FlowbiteProgress({
  progress,
  label,
  showValue = true,
  color = 'pink',
  size = 'md',
  className = '',
}: FlowbiteProgressProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorClass = {
    pink: 'bg-pink shadow-[0_0_0.5rem_var(--color-pink)]',
    cyan: 'bg-cyan shadow-[0_0_0.5rem_var(--color-cyan)]',
    lime: 'bg-lime shadow-[0_0_0.5rem_var(--color-lime)]',
    amber: 'bg-amber shadow-[0_0_0.5rem_var(--color-amber)]',
    red: 'bg-red shadow-[0_0_0.5rem_var(--color-red)]',
  }[color];

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs font-mono">
          {label && <span className="text-text-muted">{label}</span>}
          {showValue && <span className="text-text font-semibold">{clamped}%</span>}
        </div>
      )}

      <div className={`w-full bg-surface-3 rounded-full overflow-hidden border border-border-2 ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
