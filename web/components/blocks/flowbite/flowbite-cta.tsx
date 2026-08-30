/* eslint-disable @next/next/no-img-element */
import { type ReactNode } from 'react';
import Link from 'next/link';

export interface FlowbiteCtaSectionProps {
  title: ReactNode;
  description: ReactNode;
  ctaHref: string;
  ctaLabel?: string;
  imageDarkSrc?: string;
  imageLightSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function FlowbiteCtaSection({
  title,
  description,
  ctaHref,
  ctaLabel = 'Get started',
  imageDarkSrc = 'https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg',
  imageAlt = 'Dashboard mockup',
  className = '',
}: FlowbiteCtaSectionProps) {
  return (
    <section className={`py-12 md:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-8 bg-surface border border-border rounded-3xl shadow-2xl">
        <div className="flex items-center justify-center p-4 bg-surface-2/60 rounded-2xl border border-border">
          <img
            className="w-full h-auto max-h-96 object-contain rounded-lg"
            src={imageDarkSrc}
            alt={imageAlt}
            loading="lazy"
          />
        </div>
        <div className="mt-6 md:mt-0">
          <h2 className="mb-4 text-3xl font-display font-extrabold tracking-tight text-text sm:text-4xl">
            {title}
          </h2>
          <p className="mb-6 font-body text-text-muted md:text-lg leading-relaxed">
            {description}
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center text-ink bg-cyan hover:bg-cyan/90 font-mono font-medium rounded-full text-sm px-6 py-3 text-center transition duration-200 shadow-md"
          >
            {ctaLabel}
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
