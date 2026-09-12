import Link from "next/link";
import { GemLogo } from "./gem-brand-icon";
import { socialLinks } from "@/lib/site/social-links";

const SOCIAL_MARKS: Record<string, string> = {
  TikTok: "M16 2h-4v13.2a2.8 2.8 0 1 1-2.4-2.8V8.3a6.8 6.8 0 1 0 6.4 6.8V8a10 10 0 0 0 6 2V6a6 6 0 0 1-6-4Z",
  YouTube: "M22 7a3 3 0 0 0-2-2c-2-.5-14-.5-16 0a3 3 0 0 0-2 2c-.5 2-.5 8 0 10a3 3 0 0 0 2 2c2 .5 14 .5 16 0a3 3 0 0 0 2-2c.5-2 .5-8 0-10ZM10 16V8l7 4-7 4Z",
  Instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  X: "M3 3h5.5l4.7 6.3L18.6 3H21l-6.7 8 7.7 10h-5.5l-5.3-7L5.3 21H3l7-8.7L3 3Zm4.4 2H6l11.6 14H19L7.4 5Z",
  Telegram: "M21.7 3.5 2.4 11c-1.3.5-1.3 1.2-.2 1.5l5 1.6 1.9 5.7c.2.7.4.9.9.9.4 0 .7-.2 1-.5l2.5-2.4 5.2 3.8c.9.5 1.5.2 1.7-.8l3.3-16c.3-1.2-.5-1.8-2-1.3ZM9 13.7l10.2-6.4c.5-.3.9-.1.5.3l-8.3 7.5-.3 3.3L9 13.7Z",
  Discord: "M19 5a17 17 0 0 0-4-1l-.5 1a16 16 0 0 0-5 0L9 4a17 17 0 0 0-4 1C2 9 1 13 2 17a17 17 0 0 0 5 3l1-2-2-1 1 .5a14 14 0 0 0 10 0l1-.5-2 1 1 2a17 17 0 0 0 5-3c1-4 0-8-3-12ZM8 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm8 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  Facebook: "M14 22v-9h3l.5-4H14V6.5c0-1.1.3-1.5 1.7-1.5H18V1.5A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9h4Z",
};

export function SiteFooter() {
  const showDraftLinks = process.env.SITE_CONTENT_APPROVED === "true";

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
        <p
          className="max-w-3xl font-display font-bold leading-tight tracking-tight text-text"
          style={{ fontSize: "clamp(1.9rem,4.5vw,3.6rem)" }}
        >
          Make the impossible feel scheduled.
        </p>
        <hr className="my-10 border-border" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center" aria-label="Gem Studio home">
            <GemLogo width={110} />
          </Link>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-widest text-text-muted"
          >
            <Link href="/studio" className="py-1.5 transition-colors hover:text-text">
              The Studio
            </Link>
            <Link href="/system" className="py-1.5 transition-colors hover:text-text">
              The System
            </Link>
            <Link href="/docs" className="py-1.5 transition-colors hover:text-text">
              Docs
            </Link>
            <Link href="/pricing" className="py-1.5 transition-colors hover:text-text">
              Pricing
            </Link>
            <Link href="/portfolio" className="py-1.5 transition-colors hover:text-text">
              Portfolio
            </Link>
            <Link href="/contact" className="py-1.5 transition-colors hover:text-text">
              Contact
            </Link>
            {showDraftLinks && (
              <>
                <Link href="/core-values" className="py-1.5 transition-colors hover:text-text">
                  Core values
                </Link>
                <Link href="/terms" className="py-1.5 transition-colors hover:text-text">
                  Terms
                </Link>
                <Link href="/privacy" className="py-1.5 transition-colors hover:text-text">
                  Privacy
                </Link>
              </>
            )}
          </nav>
          <nav aria-label="Social links" className="flex flex-wrap items-center gap-2">
            {socialLinks.map(({ label, href }) => {
              const mark = label === "GitHub" ? "M12 2C6.5 2 2 6.5 2 12c0 4.4 2.8 8.1 6.7 9.4.5.1.7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.3-1.1.6-1.4-2.2-.2-4.5-1.1-4.5-4.8 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.7-2.3 4.6-4.5 4.8.4.3.7 1 .7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 22 12C22 6.5 17.5 2 12 2Z" : label === "GitLab" ? "M12 21.8 1.5 14l2.7-8.3c.1-.4.7-.4.8 0l2.3 7.1h9.4L19 5.7c.1-.4.7-.4.8 0l2.7 8.3L12 21.8Z" : "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 6Z";
              const icon = <svg className="h-5 w-5" fill="currentColor" fillRule="evenodd" viewBox="0 0 24 24" aria-hidden="true"><path d={SOCIAL_MARKS[label] ?? mark} /></svg>;
              return href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="rounded border border-border p-2 text-text-muted hover:text-text" aria-label={label}>{icon}</a> : <span key={label} aria-label={`${label} (not configured)`} title={`${label} link not configured`} className="rounded border border-border p-2 text-text-faint">{icon}</span>;
            })}
          </nav>
        </div>
        <p className="mt-8 text-xs text-text-faint font-mono">
          © 2026 Gem Studio™. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
