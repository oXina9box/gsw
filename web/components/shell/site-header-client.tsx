"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthActions } from "./auth-actions";
import { GemLogo } from "./gem-brand-icon";

export function SiteHeaderClient({ authenticated, userEmail }: { authenticated: boolean; userEmail?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !menuRef.current) return;

      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("keydown", trapFocus);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-border bg-surface/85 pl-5 pr-3 backdrop-blur-md">
        <Link
          href={authenticated ? "/app" : "/"}
          aria-label="Gem Studio home"
          className="inline-flex items-center transition-opacity hover:opacity-90"
          onClick={closeMenu}
        >
          <GemLogo width={110} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7" aria-label="Primary navigation">
          <Link
            href="/studio"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-cyan"
          >
            The Studio
          </Link>
          <Link
            href="/system"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-cyan"
          >
            The System
          </Link>
          <Link
            href="/docs"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-lime"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-amber"
          >
            Pricing
          </Link>
          <Link
            href="/portfolio"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-pink"
          >
            Portfolio
          </Link>
        </nav>

        {/* Desktop Account / Action Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <AuthActions authenticated={authenticated} userEmail={userEmail} />
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden">
          <button
            ref={toggleRef}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="p-2 text-text-muted transition duration-200 rounded-full hover:bg-surface-2 hover:text-text focus:outline-none focus:ring-2 focus:ring-cyan"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M3 5h18a1 1 0 010 2H3a1 1 0 010-2zm0 6h18a1 1 0 010 2H3a1 1 0 010-2zm0 6h18a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div ref={menuRef} className="lg:hidden mx-auto mt-2 max-w-5xl rounded-2xl border border-border bg-surface/95 p-4 backdrop-blur-md">
          <nav aria-label="Primary navigation" className="flex flex-col space-y-1">
            <Link
              href="/studio"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-cyan py-3 block"
              onClick={closeMenu}
            >
              The Studio
            </Link>
            <Link
              href="/system"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-cyan py-3 block"
              onClick={closeMenu}
            >
              The System
            </Link>
            <Link
              href="/docs"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-lime py-3 block"
              onClick={closeMenu}
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-amber py-3 block"
              onClick={closeMenu}
            >
              Pricing
            </Link>
            <Link
              href="/portfolio"
              className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-pink py-3 block"
              onClick={closeMenu}
            >
              Portfolio
            </Link>
          </nav>
          <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
            <AuthActions authenticated={authenticated} userEmail={userEmail} />
          </div>
        </div>
      )}
    </header>
  );
}
