import { type ReactNode } from 'react';

interface ContactInfoItem {
  label: string;
  value: string;
  href?: string;
}

interface KometaContactProps {
  kicker?: string;
  title?: ReactNode;
  lede?: ReactNode;
  infoItems?: ContactInfoItem[];
  formSlot: ReactNode;
  className?: string;
}

export function KometaContact({
  kicker,
  title,
  lede,
  infoItems,
  formSlot,
  className = '',
}: KometaContactProps) {
  const baseClasses = 'py-12 md:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]';
  const fullClassName = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <section className={fullClassName}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
              {kicker}
            </p>
          )}

          {title && (
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-text">
              {title}
            </h1>
          )}

          {lede && (
            <div className="text-base text-text-muted font-body leading-relaxed">
              {lede}
            </div>
          )}

          {infoItems && infoItems.length > 0 && (
            <div className="pt-6 border-t border-border space-y-4">
              {infoItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-mono text-xs text-text-faint uppercase">
                    {item.label}
                  </span>
                  <div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-body text-cyan hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-body text-text">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 border border-border bg-surface rounded-md">
          {formSlot}
        </div>
      </div>
    </section>
  );
}
