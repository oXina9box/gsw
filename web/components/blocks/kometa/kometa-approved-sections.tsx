/* eslint-disable @next/next/no-img-element */
import { type ReactNode } from 'react';
import Link from 'next/link';

// C1: 2-column layout — 3 stacked icon+bullet items on left, 3-image mosaic on right
export interface KometaC1Item {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface KometaC1Props {
  badge?: string;
  badgeColor?: 'pink' | 'cyan' | 'lime' | 'amber';
  title: ReactNode;
  lede?: ReactNode;
  items: KometaC1Item[];
  images: {
    hero: string;
    small1: string;
    small2: string;
    alt?: string;
  };
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

export function KometaC1Section({
  badge = 'Studio Architecture',
  badgeColor = 'cyan',
  title,
  lede,
  items,
  images,
  headingLevel = 'h2',
  className = '',
}: KometaC1Props) {
  const Heading = headingLevel;
  const badgeClasses = {
    pink: 'text-pink bg-pink/10 border-pink/30',
    cyan: 'text-cyan bg-cyan/10 border-cyan/30',
    lime: 'text-lime bg-lime/10 border-lime/30',
    amber: 'text-amber bg-amber/10 border-amber/30',
  }[badgeColor];

  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="grid gap-12 lg:grid-cols-12 items-center">
        <div className="lg:col-span-5 flex flex-col justify-center">
          {badge && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border ${badgeClasses}`}>
                {badge}
              </span>
            </div>
          )}
          <Heading className="mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {title}
          </Heading>
          {lede && <p className="mb-8 text-base text-text-muted font-body leading-relaxed">{lede}</p>}
          <div className="divide-y divide-border border-y border-border">
            {items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-start gap-4">
                <span className="font-mono text-xs font-semibold text-pink pt-1 shrink-0">
                  0{idx + 1}
                </span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-text font-display">{item.title}</h3>
                  <p className="text-sm text-text-muted font-body leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 gap-3">
          <img
            className="col-span-2 w-full h-64 object-cover rounded-md border border-border"
            src={images.hero}
            alt={images.alt ?? 'Production asset'}
            loading="lazy"
          />
          <img
            className="w-full h-44 object-cover rounded-md border border-border"
            src={images.small1}
            alt={images.alt ?? 'Asset thumbnail'}
            loading="lazy"
          />
          <img
            className="w-full h-44 object-cover rounded-md border border-border"
            src={images.small2}
            alt={images.alt ?? 'Asset thumbnail'}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

// C2: 2-column layout — Heading + lede + 2 card pills on left, single featured media on right
export interface KometaC2Props {
  title: ReactNode;
  lede: ReactNode;
  pill1: { title: string; description: string };
  pill2: { title: string; description: string };
  imageSrc: string;
  imageAlt?: string;
  highlightColor?: 'pink' | 'cyan' | 'lime' | 'amber';
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

export function KometaC2Section({
  title,
  lede,
  pill1,
  pill2,
  imageSrc,
  imageAlt = 'Feature image',
  highlightColor = 'cyan',
  headingLevel = 'h2',
  className = '',
}: KometaC2Props) {
  const Heading = headingLevel;
  const accentBorder = {
    pink: 'border-pink bg-surface-2',
    cyan: 'border-cyan bg-surface-2',
    lime: 'border-lime bg-surface-2',
    amber: 'border-amber bg-surface-2',
  }[highlightColor];

  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="flex flex-col justify-center">
          <div className="max-w-xl mb-6">
            <Heading className="mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {title}
            </Heading>
            <p className="text-base text-text-muted font-body leading-relaxed">
              {lede}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`border-l-2 ${accentBorder} border border-border rounded-sm p-5`}>
              <h3 className="mb-2 text-base font-semibold text-text font-display">{pill1.title}</h3>
              <p className="text-sm text-text-muted font-body leading-relaxed">{pill1.description}</p>
            </div>
            <div className={`border-l-2 ${accentBorder} border border-border rounded-sm p-5`}>
              <h3 className="mb-2 text-base font-semibold text-text font-display">{pill2.title}</h3>
              <p className="text-sm text-text-muted font-body leading-relaxed">{pill2.description}</p>
            </div>
          </div>
        </div>
        <div>
          <img
            className="w-full h-64 object-cover rounded-md border border-border sm:h-96"
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

// S1: 3-column linear step sequence with numbered badges and connecting arrows
export interface KometaStepItem {
  step: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export interface KometaStepProps {
  badge?: string;
  title: ReactNode;
  lede?: ReactNode;
  steps: [KometaStepItem, KometaStepItem, KometaStepItem];
  className?: string;
}

export function KometaStepSection({
  badge = 'Three-Stage Pipeline',
  title,
  lede,
  steps,
  className = '',
}: KometaStepProps) {
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {badge && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-lime/30 text-lime bg-lime/10">
              {badge}
            </span>
          </div>
        )}
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted font-body leading-relaxed">{lede}</p>}
      </div>
      <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-md overflow-hidden">
        {steps.map((item, idx) => (
          <div key={idx} className="bg-surface p-8 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-semibold text-pink uppercase tracking-widest block mb-4">
                Step 0{idx + 1}
              </span>
              <h3 className="mb-2 text-xl font-bold font-display text-text">{item.title}</h3>
              <p className="mb-6 text-sm text-text-muted font-body leading-relaxed">
                {item.description}
              </p>
            </div>
            {item.href && (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-semibold font-mono text-cyan hover:underline"
              >
                {item.linkLabel ?? 'Learn more →'}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// F1: 6-column category pill grid with circular icon headers + CTA bar
export interface KometaF1Item {
  label: string;
  icon?: ReactNode;
  href?: string;
}

export interface KometaF1Props {
  title: ReactNode;
  lede?: ReactNode;
  items: KometaF1Item[];
  ctaHref?: string;
  ctaLabel?: string;
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

export function KometaF1Section({
  title,
  lede,
  items,
  ctaHref = '/docs',
  ctaLabel = 'Explore Studio Architecture',
  headingLevel = 'h2',
  className = '',
}: KometaF1Props) {
  const Heading = headingLevel;
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <Heading className="mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </Heading>
        {lede && <p className="text-base text-text-muted font-body leading-relaxed">{lede}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border border border-border rounded-md overflow-hidden mb-10">
        {items.map((item, idx) => (
          <div key={idx} className="bg-surface p-6 text-center flex flex-col items-center justify-center transition-colors hover:bg-surface-2">
            <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-cyan/10 border border-cyan/20 text-cyan">
              {item.icon ?? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-text font-semibold">{item.label}</h4>
          </div>
        ))}
      </div>
      {ctaHref && (
        <div className="text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center h-11 px-6 font-mono text-sm tracking-wide text-ink bg-cyan hover:bg-cyan/90 transition-colors rounded-full font-semibold"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

// F2: 4-column space/system feature cards with checklists + learn more links
export interface KometaF2Card {
  title: string;
  description: string;
  bullets: string[];
  href?: string;
}

export interface KometaF2Props {
  heading: ReactNode;
  lede: ReactNode;
  cards: [KometaF2Card, KometaF2Card, KometaF2Card, KometaF2Card];
  className?: string;
}

export function KometaF2Section({
  heading,
  lede,
  cards,
  className = '',
}: KometaF2Props) {
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="flex flex-col mb-8 lg:flex-row md:mb-12 gap-6 items-start">
        <div className="lg:w-1/2">
          <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {heading}
          </h2>
        </div>
        <div className="lg:w-1/2">
          <p className="text-base text-text-muted font-body leading-relaxed">
            {lede}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-surface p-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-semibold text-pink block mb-4">
                0{idx + 1}
              </span>
              <h3 className="mb-2 text-lg font-bold font-display text-text">{card.title}</h3>
              <p className="mb-4 text-sm text-text-muted font-body leading-relaxed">{card.description}</p>
              <ul className="mb-6 space-y-2 text-sm text-text font-body">
                {card.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2">
                    <span className="text-pink shrink-0">✓</span> <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {card.href && (
              <Link href={card.href} className="inline-flex items-center text-xs uppercase tracking-wider font-semibold font-mono text-pink hover:underline">
                Explore department →
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// C3: 2-column interactive hover-border spotlight cards with arrow links
export interface KometaC3Item {
  title: string;
  description: string;
  href: string;
}

export interface KometaC3Props {
  items: KometaC3Item[];
  className?: string;
}

export function KometaC3Section({ items, className = '' }: KometaC3Props) {
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="grid max-w-screen-lg gap-4 sm:mx-auto md:grid-cols-2">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group block p-8 bg-surface-2 border border-border rounded-md transition-colors hover:border-cyan"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="mb-2 text-lg font-bold font-display text-text group-hover:text-cyan transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted font-body leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-text-muted group-hover:text-cyan group-hover:translate-x-1 inline-flex items-center transition-all">
                View →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// C4: 50/50 split diagonal image banner + CTA card
export interface KometaC4Props {
  badge?: string;
  title: string;
  description: string;
  imageSrc: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  headingLevel?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function KometaC4Section({
  badge = 'Production Standard',
  title,
  description,
  imageSrc,
  primaryCta,
  secondaryCta,
  headingLevel = 'h2',
  className = '',
}: KometaC4Props) {
  const Heading = headingLevel;
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="grid lg:grid-cols-2 border border-border rounded-md overflow-hidden bg-surface max-w-screen-lg sm:mx-auto">
        <div className="relative min-h-64 sm:min-h-80 lg:min-h-full">
          <img
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center p-8 lg:p-10">
          {badge && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-pink/30 text-pink bg-pink/10">
                {badge}
              </span>
            </div>
          )}
          <Heading className="mb-4 text-2xl font-bold font-display text-text sm:text-3xl">
            {title}
          </Heading>
          <p className="mb-6 text-sm text-text-muted font-body leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center px-6 py-3 font-semibold font-mono text-sm text-ink bg-pink hover:bg-pink/90 transition-colors rounded-full"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center font-mono text-xs uppercase tracking-widest text-pink hover:underline"
              >
                {secondaryCta.label} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// C5: 4-card vertical staggered hover grid with bottom CTA button
export interface KometaC5Item {
  title: string;
  description: string;
}

export interface KometaC5Props {
  badge?: string;
  title: ReactNode;
  lede?: ReactNode;
  cards: [KometaC5Item, KometaC5Item, KometaC5Item, KometaC5Item];
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
}

export function KometaC5Section({
  badge = 'System Invariants',
  title,
  lede,
  cards,
  ctaHref = '/docs',
  ctaLabel = 'Explore Documentation',
  className = '',
}: KometaC5Props) {
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {badge && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-cyan/30 text-cyan bg-cyan/10">
              {badge}
            </span>
          </div>
        )}
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted font-body leading-relaxed">{lede}</p>}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-10 max-w-screen-lg mx-auto">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`border-l-2 border-l-cyan border border-border bg-surface-2 p-6 rounded-sm hover:-translate-y-1 transition-transform ${
              idx % 2 === 1 ? 'md:translate-y-6' : ''
            }`}
          >
            <h3 className="mb-2 font-bold font-display text-base text-text">{card.title}</h3>
            <p className="text-sm text-text-muted font-body leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
      {ctaHref && (
        <div className="text-center pt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-6 py-3 font-mono text-sm tracking-wide text-ink bg-cyan hover:bg-cyan/90 transition-colors rounded-full font-semibold"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
