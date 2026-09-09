import Link from "next/link";
import { GemLogo } from "./gem-brand-icon";

export function SiteFooter() {
  const showDraftLinks = process.env.SITE_CONTENT_APPROVED === "true";

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6">
        <p
          className="max-w-3xl font-display font-bold leading-tight tracking-tight text-text"
          style={{ fontSize: "clamp(1.9rem,4.5vw,3.6rem)" }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/oXina9box/gsw"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-text"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://gitlab.com/oxina9box/gsw"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-text"
              aria-label="GitLab"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.417-.724-.417-.859 0L16.425 9.45H7.574L4.91 1.263c-.135-.417-.724-.417-.859 0L1.387 9.452.045 13.587c-.121.375.014.786.331 1.015L12 22.148l11.624-7.546c.318-.23.453-.64.331-1.015" />
              </svg>
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs text-text-faint font-mono">
          © 2026 Gem Studio™. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
