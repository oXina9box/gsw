import { type ReactNode } from 'react';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  icon?: ReactNode;
}

interface PrelineStepperProps {
  steps: StepperStep[];
  className?: string;
}

export function PrelineStepper({
  steps,
  className = '',
}: PrelineStepperProps) {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isDone = step.isCompleted;
          const isCurrent = step.isCurrent;

          return (
            <li key={step.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono transition-colors duration-150 ${
                  isCurrent
                    ? 'border-pink bg-pink/10 text-text font-semibold shadow-[0_0_0.5rem_var(--color-pink-34)]'
                    : isDone
                      ? 'border-lime/40 bg-lime/10 text-lime'
                      : 'border-border bg-surface-2 text-text-faint'
                }`}
              >
                <span className="font-bold">
                  {isDone ? '✓' : idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </span>
                <span>{step.title}</span>
              </div>

              {idx < steps.length - 1 && (
                <span className="text-text-faint font-mono text-xs hidden sm:inline">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
