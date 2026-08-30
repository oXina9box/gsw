import { type ReactNode } from 'react';

export interface StepItem {
  index: string;
  title: string;
  description: string;
  status?: 'active' | 'completed' | 'pending';
  badge?: string;
}

interface KometaStepsProps {
  kicker?: string;
  title?: ReactNode;
  steps: StepItem[];
  className?: string;
}

export function KometaSteps({
  kicker,
  title,
  steps,
  className = '',
}: KometaStepsProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      {(kicker || title) && (
        <div className="mb-8 md:mb-12 space-y-2">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border border-border bg-surface rounded-md">
        {steps.map((step) => {
          const dotColor =
            step.status === 'completed'
              ? 'bg-lime text-lime shadow-[0_0_0.5rem_var(--color-lime)]'
              : step.status === 'active'
                ? 'bg-cyan text-cyan shadow-[0_0_0.5rem_var(--color-cyan)]'
                : 'bg-border text-text-faint';

          return (
            <div key={step.index} className="flex flex-col justify-between space-y-3 p-4 border border-border-2 bg-surface-2 rounded-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-faint">{step.index}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-text mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-text-muted font-body leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.badge && (
                <div className="pt-2">
                  <span className="inline-block px-2 py-0.5 font-mono text-[10px] text-text-muted bg-surface-3 rounded-full border border-border">
                    {step.badge}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
