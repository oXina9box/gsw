import { type ReactNode } from 'react';

interface KometaHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede: ReactNode;
  actions?: ReactNode;
  footnote?: ReactNode;
  stageSlot?: ReactNode;
  className?: string;
}

export function KometaHero({
  eyebrow,
  title,
  lede,
  actions,
  footnote,
  stageSlot,
  className = '',
}: KometaHeroProps) {
  return (
    <section className={`py-12 md:py-20 lg:py-24 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className={`space-y-6 ${stageSlot ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3 text-center'}`}>
          {eyebrow && (
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-pink">
              {eyebrow}
            </div>
          )}

          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-text leading-[1.05]">
            {title}
          </h1>

          <div className="text-base sm:text-lg text-text-muted max-w-2xl font-body leading-relaxed">
            {lede}
          </div>

          {actions && (
            <div className={`flex flex-wrap items-center gap-4 pt-2 ${stageSlot ? '' : 'justify-center'}`}>
              {actions}
            </div>
          )}

          {footnote && (
            <div className="pt-4 border-t border-border text-xs font-mono text-text-faint">
              {footnote}
            </div>
          )}
        </div>

        {stageSlot && (
          <div className="lg:col-span-6 w-full">
            {stageSlot}
          </div>
        )}
      </div>
    </section>
  );
}
