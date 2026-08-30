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
  return (
    <section className={`px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-8 lg:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both] ${className}`}>
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-amber/30 text-amber bg-amber/10">
          Continuous Continuity
        </span>
        <h2 className="max-w-lg mb-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:mx-auto">
          {title}
        </h2>
        <p className="text-base text-text-muted md:text-lg font-body">{subtitle}</p>
      </div>

      <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        {/* Soft top & bottom gradient masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="flex flex-col space-y-4">
            {column1.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-2 border border-border hover:border-amber/40 transition duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/30 text-amber flex items-center justify-center font-mono font-bold text-xs shrink-0">
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
          <div className="flex flex-col space-y-4">
            {column2.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-2 border border-border hover:border-cyan/40 transition duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center font-mono font-bold text-xs shrink-0">
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
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-surface border border-border overflow-hidden shadow-2xl">
        {/* Left Sidebar / Metric Cards */}
        <div className="lg:col-span-5 p-8 lg:p-12 bg-surface-2/70 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-pink/30 text-pink bg-pink/10">
              {sidebarTagline}
            </span>
            <h2 className="text-2xl font-display font-bold text-text mb-8">
              {sidebarHeadline}
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-border shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-text-faint mb-1">
                  <span>Referral Traffic</span>
                  <span className="text-cyan">164k</span>
                </div>
                <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-cyan" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-text-faint">Continuity Lock</div>
                  <div className="text-lg font-bold font-mono text-lime">27,058 <span className="text-xs text-lime">↑ 22%</span></div>
                </div>
                <div className="text-xs font-mono text-text-faint text-right">
                  <div>Market Share</div>
                  <div className="text-sm font-bold text-text">1,529</div>
                </div>
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
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
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
