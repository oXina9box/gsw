import { type ReactNode } from 'react';
import Link from 'next/link';

export interface FlowbiteCtaSectionProps {
  title: ReactNode;
  description: ReactNode;
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
}

export function FlowbiteCtaSection({
  title,
  description,
  ctaHref,
  ctaLabel = 'Create Studio →',
  className = '',
}: FlowbiteCtaSectionProps) {
  const baseClasses = 'border-y border-border bg-surface-2 px-4 py-20 text-center animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="mx-auto max-w-2xl">
        <h2
          className="font-display font-bold tracking-tight text-text leading-tight"
          style={{ fontSize: 'clamp(1.9rem,4vw,3.4rem)' }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-4 mb-8 max-w-xl text-base text-text-muted font-body leading-relaxed md:text-lg">
          {description}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-full bg-pink px-8 py-3.5 font-mono text-sm font-semibold text-ink transition-colors hover:bg-pink-hover"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
