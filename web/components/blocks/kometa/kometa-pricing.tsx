'use client';

import { type ReactNode } from 'react';

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  featured?: boolean;
  actionLabel: string;
  actionHref?: string;
  onClick?: () => void;
  badge?: string;
  footnote?: string;
}

interface KometaPricingProps {
  kicker?: string;
  title?: ReactNode;
  lede?: ReactNode;
  tiers: PricingTier[];
  footer?: ReactNode;
  className?: string;
}

export function KometaPricing({
  kicker,
  title,
  lede,
  tiers,
  footer,
  className = '',
}: KometaPricingProps) {
  return (
    <section className={`py-12 md:py-20 ${className}`}>
      {(kicker || title || lede) && (
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-text">
              {title}
            </h2>
          )}
          {lede && (
            <div className="text-base sm:text-lg text-text-muted font-body">
              {lede}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {tiers.map((tier) => {
          const isFeatured = tier.featured;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-md transition-all duration-200 ${
                isFeatured
                  ? 'border-2 border-cyan bg-surface-2 shadow-[0_0_2rem_color-mix(in_oklch,var(--color-cyan)_15%,transparent)]'
                  : 'border border-border bg-surface'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 font-mono text-xs font-semibold text-ink bg-cyan rounded-full uppercase tracking-wider">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-text">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-2 font-body">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-8 flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-text tabular-nums">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="font-mono text-xs text-text-faint">
                      {tier.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 text-sm text-text-muted font-body">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-cyan font-bold font-mono">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {tier.actionHref ? (
                  <a
                    href={tier.actionHref}
                    className={`w-full py-3 px-4 rounded-full font-semibold text-sm flex items-center justify-center transition-colors duration-150 ${
                      isFeatured
                        ? 'bg-cyan text-ink hover:bg-white'
                        : 'bg-surface-3 text-text hover:bg-border border border-border'
                    }`}
                  >
                    {tier.actionLabel}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={tier.onClick}
                    className={`w-full py-3 px-4 rounded-full font-semibold text-sm flex items-center justify-center transition-colors duration-150 ${
                      isFeatured
                        ? 'bg-cyan text-ink hover:bg-white'
                        : 'bg-surface-3 text-text hover:bg-border border border-border'
                    }`}
                  >
                    {tier.actionLabel}
                  </button>
                )}

                {tier.footnote && (
                  <p className="mt-3 text-center text-xs font-mono text-text-faint">
                    {tier.footnote}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {footer && (
        <div className="mt-12 text-center text-sm text-text-muted font-body">
          {footer}
        </div>
      )}
    </section>
  );
}
