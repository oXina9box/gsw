/* eslint-disable @next/next/no-img-element */
import { type ReactNode } from 'react';

export interface PrelineMarqueeItem {
  name: string;
  handle: string;
  text: string;
  avatar?: string;
}

export interface PrelineVerticalMarqueeProps {
  title?: string;
  subtitle?: string;
  column1: PrelineMarqueeItem[];
  column2: PrelineMarqueeItem[];
  className?: string;
}

export function PrelineVerticalMarquee({
  title = 'Real studio signals',
  subtitle = 'Two continuous testimonial streams from production floors running GenPlay and continuous agent pipelines.',
  column1,
  column2,
  className = '',
}: PrelineVerticalMarqueeProps) {
  const col1Items = [...column1, ...column1];
  const col2Items = [...column2, ...column2];
  const baseClasses = 'px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-amber/30 text-amber bg-amber/10">
          Continuous Continuity
        </span>
        <h2 className="max-w-lg mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        <p className="text-base text-text-muted md:text-lg font-body">{subtitle}</p>
      </div>

      <div className="marquee-frame relative mx-auto max-w-5xl overflow-hidden border border-border rounded-md bg-surface p-6">
        {/* Soft top & bottom gradient masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32rem] overflow-hidden">
          {/* Column 1 */}
          <div className="marquee-col">
            {col1Items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-sm border border-border bg-surface-2 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-amber/10 border border-amber/30 text-amber flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold font-display text-text">{item.name}</h4>
                    <p className="text-xs text-text-faint font-mono">{item.handle}</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted font-body leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="marquee-col marquee-col-reverse">
            {col2Items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-sm border border-border bg-surface-2 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold font-display text-text">{item.name}</h4>
                    <p className="text-xs text-text-faint font-mono">{item.handle}</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted font-body leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Split Auth Layout Component
export interface PrelineSplitAuthProps {
  title: string;
  subtitle: string;
  sidebarTagline?: string;
  sidebarHeadline?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function PrelineSplitAuth({
  title,
  subtitle,
  sidebarTagline = 'Gem Studio Architecture',
  sidebarHeadline = 'The simplest way to manage your autonomous AI film studio',
  children,
  footer,
  className = '',
}: PrelineSplitAuthProps) {
  return (
    <div className={`min-h-[calc(100vh-14rem)] flex items-center justify-center py-8 px-4 ${className}`}>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-md bg-surface border border-border overflow-hidden">
        {/* Left Sidebar / Metric Cards */}
        <div className="lg:col-span-5 p-8 bg-surface-2 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-pink/30 text-pink bg-pink/10">
              {sidebarTagline}
            </span>
            <h2 className="text-2xl font-display font-bold text-text mb-6">
              {sidebarHeadline}
            </h2>

            <div className="border-t border-border mt-6">
              <div className="flex justify-between border-b border-border py-3 font-mono text-xs text-text-muted">
                <span>Continuity locks</span>
                <span className="text-text font-semibold">—</span>
              </div>
              <div className="flex justify-between border-b border-border py-3 font-mono text-xs text-text-muted">
                <span>Active agents</span>
                <span className="text-text font-semibold">—</span>
              </div>
              <div className="flex justify-between border-b border-border py-3 font-mono text-xs text-text-muted">
                <span>Render queue</span>
                <span className="text-text font-semibold">—</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-border flex items-center gap-4 text-xs font-mono text-text-faint">
            <span>OpenAI</span>
            <span>·</span>
            <span>Anthropic</span>
            <span>·</span>
            <span>Replicate</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text mb-2">
              {title}
            </h1>
            <p className="text-sm text-text-muted font-body">
              {subtitle}
            </p>
          </div>

          <div>{children}</div>

          {footer && (
            <div className="mt-8 pt-6 border-t border-border text-center text-xs font-body text-text-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
