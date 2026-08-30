import { type ReactNode } from 'react';

export interface ContentCardItem {
  id?: string;
  tag?: string;
  tagColor?: 'pink' | 'cyan' | 'lime' | 'amber';
  title: string;
  description: string;
  meta?: string;
  href?: string;
  imageSlot?: ReactNode;
}

interface KometaContentProps {
  kicker?: string;
  title?: ReactNode;
  lede?: ReactNode;
  cards: ContentCardItem[];
  columns?: 2 | 3;
  className?: string;
}

export function KometaContent({
  kicker,
  title,
  lede,
  cards,
  columns = 3,
  className = '',
}: KometaContentProps) {
  const colClass =
    columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const tagColors = {
    pink: 'text-pink border-pink/30 bg-pink/10',
    cyan: 'text-cyan border-cyan/30 bg-cyan/10',
    lime: 'text-lime border-lime/30 bg-lime/10',
    amber: 'text-amber border-amber/30 bg-amber/10',
  };

  return (
    <section className={`py-12 md:py-16 ${className}`}>
      {(kicker || title || lede) && (
        <div className="mb-8 md:mb-12 space-y-3">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}
          {title && (
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-text">
              {title}
            </h2>
          )}
          {lede && (
            <div className="text-sm sm:text-base text-text-muted max-w-2xl font-body">
              {lede}
            </div>
          )}
        </div>
      )}

      <div className={`grid ${colClass} gap-6`}>
        {cards.map((card, idx) => (
          <article
            key={card.id ?? idx}
            className="flex flex-col justify-between border border-border bg-surface rounded-md overflow-hidden transition-all duration-200 hover:border-cyan hover:bg-surface-2"
          >
            {card.imageSlot && (
              <div className="w-full aspect-video bg-bg border-b border-border overflow-hidden">
                {card.imageSlot}
              </div>
            )}

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                {card.tag && (
                  <div className="mb-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
                        tagColors[card.tagColor ?? 'cyan']
                      }`}
                    >
                      {card.tag}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-xl font-semibold text-text tracking-tight mb-2">
                  {card.title}
                </h3>

                <p className="text-sm text-text-muted font-body leading-relaxed">
                  {card.description}
                </p>
              </div>

              {(card.meta || card.href) && (
                <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs font-mono text-text-faint">
                  {card.meta && <span>{card.meta}</span>}
                  {card.href && (
                    <a
                      href={card.href}
                      className="text-cyan hover:underline inline-flex items-center gap-1 ml-auto"
                    >
                      <span>Read</span>
                      <span>→</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
