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
  className?: string;
}

export function KometaC1Section({
  badge = 'Studio Architecture',
  badgeColor = 'cyan',
  title,
  lede,
  items,
  images,
  className = '',
}: KometaC1Props) {
  const badgeClasses = {
    pink: 'text-pink bg-pink/10 border-pink/30',
    cyan: 'text-cyan bg-cyan/10 border-cyan/30',
    lime: 'text-lime bg-lime/10 border-lime/30',
    amber: 'text-amber bg-amber/10 border-amber/30',
  }[badgeColor];

  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {badge && (
          <div>
            <span className={`inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border ${badgeClasses}`}>
              {badge}
            </span>
          </div>
        )}
        <h2 className="max-w-lg mb-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted md:text-lg font-body">{lede}</p>}
      </div>
      <div className="grid max-w-screen-lg gap-8 lg:grid-cols-2 sm:mx-auto items-center">
        <div className="flex flex-col justify-center space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex">
              <div className="mr-4 shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
                  {item.icon ?? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-text font-display">{item.title}</h3>
                <p className="text-sm text-text-muted font-body leading-relaxed">{item.description}</p>
                {idx < items.length - 1 && <hr className="w-full my-4 border-border" />}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img
            className="object-cover w-full h-56 col-span-2 rounded-xl shadow-lg border border-border"
            src={images.hero}
            alt={images.alt ?? 'Production asset'}
            loading="lazy"
          />
          <img
            className="object-cover w-full h-44 rounded-xl shadow-md border border-border"
            src={images.small1}
            alt={images.alt ?? 'Asset thumbnail'}
            loading="lazy"
          />
          <img
            className="object-cover w-full h-44 rounded-xl shadow-md border border-border"
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
  className = '',
}: KometaC2Props) {
  const accentBorder = {
    pink: 'border-pink/40 bg-pink/5',
    cyan: 'border-cyan/40 bg-cyan/5',
    lime: 'border-lime/40 bg-lime/5',
    amber: 'border-amber/40 bg-amber/5',
  }[highlightColor];

  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="grid gap-8 row-gap-8 lg:grid-cols-2 items-center">
        <div className="flex flex-col justify-center">
          <div className="max-w-xl mb-6">
            <h2 className="max-w-lg mb-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {title}
            </h2>
            <p className="text-base text-text-muted md:text-lg font-body leading-relaxed">
              {lede}
            </p>
          </div>
          <div className="grid gap-5 row-gap-6 sm:grid-cols-2">
            <div className={`border-l-4 rounded-r-xl border border-border p-5 ${accentBorder}`}>
              <h3 className="mb-2 text-base font-semibold text-text font-display">{pill1.title}</h3>
              <p className="text-sm text-text-muted font-body leading-relaxed">{pill1.description}</p>
            </div>
            <div className={`border-l-4 rounded-r-xl border border-border p-5 ${accentBorder}`}>
              <h3 className="mb-2 text-base font-semibold text-text font-display">{pill2.title}</h3>
              <p className="text-sm text-text-muted font-body leading-relaxed">{pill2.description}</p>
            </div>
          </div>
        </div>
        <div>
          <img
            className="object-cover w-full h-64 rounded-2xl shadow-xl border border-border sm:h-96"
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
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {badge && (
          <div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-lime/30 text-lime bg-lime/10">
              {badge}
            </span>
          </div>
        )}
        <h2 className="max-w-lg mb-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted md:text-lg font-body">{lede}</p>}
      </div>
      <div className="grid gap-8 row-gap-6 lg:grid-cols-3">
        {steps.map((item, idx) => (
          <div key={idx} className="relative text-center p-6 rounded-2xl bg-surface border border-border flex flex-col items-center">
            <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xl font-bold font-mono sm:w-16 sm:h-16">
              0{idx + 1}
            </div>
            <h3 className="mb-2 text-xl font-bold font-display text-text">{item.title}</h3>
            <p className="max-w-md mb-4 text-sm text-text-muted sm:mx-auto font-body leading-relaxed">
              {item.description}
            </p>
            {item.href && (
              <Link
                href={item.href}
                className="mt-auto inline-flex items-center text-sm font-semibold font-mono text-cyan hover:underline"
              >
                {item.linkLabel ?? 'Learn more →'}
              </Link>
            )}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex top-1/2 -right-4 -translate-y-1/2 absolute z-10 text-border">
                <svg className="w-8 h-8 text-cyan/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
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
  className?: string;
}

export function KometaF1Section({
  title,
  lede,
  items,
  ctaHref = '/docs',
  ctaLabel = 'Explore Studio Architecture',
  className = '',
}: KometaF1Props) {
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <h2 className="max-w-lg mb-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted md:text-lg font-body">{lede}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 row-gap-6 mb-10 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item, idx) => (
          <div key={idx} className="text-center p-4 rounded-xl bg-surface border border-border transition duration-200 hover:border-cyan/50 hover:bg-surface-2">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-full bg-cyan/10 border border-cyan/20 text-cyan">
              {item.icon ?? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <h4 className="font-semibold text-sm text-text font-display">{item.label}</h4>
          </div>
        ))}
      </div>
      {ctaHref && (
        <div className="text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-ink bg-cyan hover:bg-cyan/90 transition duration-200 rounded-full shadow-lg font-mono text-sm"
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
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="flex flex-col mb-8 lg:flex-row md:mb-12 gap-6 items-start">
        <div className="lg:w-1/2">
          <h2 className="max-w-md font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {heading}
          </h2>
        </div>
        <div className="lg:w-1/2">
          <p className="text-base text-text-muted md:text-lg font-body leading-relaxed">
            {lede}
          </p>
        </div>
      </div>
      <div className="grid gap-6 row-gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-lime/40 transition duration-200">
            <div>
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-lime/10 text-lime border border-lime/30 font-mono font-bold">
                0{idx + 1}
              </div>
              <h3 className="mb-2 text-lg font-bold font-display text-text">{card.title}</h3>
              <p className="mb-4 text-sm text-text-muted font-body leading-relaxed">{card.description}</p>
              <ul className="mb-6 space-y-2 text-sm text-text font-body">
                {card.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-2">
                    <span className="text-lime">✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>
            {card.href && (
              <Link href={card.href} className="inline-flex items-center text-sm font-semibold font-mono text-lime hover:underline">
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
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="grid max-w-screen-lg gap-6 sm:mx-auto lg:grid-cols-2">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group relative block p-6 bg-surface border border-border rounded-2xl transition duration-300 hover:border-amber/60 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <h3 className="mb-2 text-lg font-bold font-display text-text group-hover:text-amber transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted font-body leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2 text-text-muted group-hover:text-amber group-hover:bg-amber/10 transition-colors">
                →
              </div>
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
  className?: string;
}

export function KometaC4Section({
  badge = 'Production Standard',
  title,
  description,
  imageSrc,
  primaryCta,
  secondaryCta,
  className = '',
}: KometaC4Props) {
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="flex flex-col max-w-screen-lg overflow-hidden bg-surface border border-border rounded-3xl shadow-xl lg:flex-row sm:mx-auto">
        <div className="relative lg:w-1/2 min-h-64 sm:min-h-80">
          <img
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center p-8 bg-surface lg:p-14 lg:w-1/2">
          {badge && (
            <div>
              <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-pink/30 text-pink bg-pink/10">
                {badge}
              </span>
            </div>
          )}
          <h3 className="mb-4 text-2xl font-bold font-display text-text sm:text-3xl">
            {title}
          </h3>
          <p className="mb-6 text-sm text-text-muted font-body leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center h-11 px-6 font-medium text-sm tracking-wide text-ink bg-pink hover:bg-pink/90 transition duration-200 rounded-full font-mono shadow-md"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="inline-flex items-center font-semibold text-sm font-mono text-pink hover:underline"
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
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        {badge && (
          <div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-cyan/30 text-cyan bg-cyan/10">
              {badge}
            </span>
          </div>
        )}
        <h2 className="max-w-lg mb-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        {lede && <p className="text-base text-text-muted md:text-lg font-body">{lede}</p>}
      </div>
      <div className="grid gap-6 row-gap-5 mb-10 md:row-gap-8 lg:grid-cols-4 sm:grid-cols-2">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="duration-300 transform bg-surface border-l-4 border-cyan rounded-r-2xl border border-border p-6 shadow-md hover:-translate-y-1.5 transition-all"
          >
            <h3 className="mb-2 font-bold font-display text-base text-text">{card.title}</h3>
            <p className="text-sm text-text-muted font-body leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
      {ctaHref && (
        <div className="text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-ink bg-cyan hover:bg-cyan/90 transition duration-200 rounded-full font-mono text-sm shadow-md"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </section>
  );
}
