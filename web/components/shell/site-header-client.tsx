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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="px-4 py-3.5 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between">
          <Link
            href={authenticated ? "/app" : "/"}
            aria-label={authenticated ? "Open Gem Studio" : "Gem Studio home"}
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
            onClick={closeMenu}
          >
            <GemLogo width={140} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7" aria-label="Primary navigation">
            <Link
              href="/studio"
              className="font-medium tracking-wide text-sm text-text-muted transition-colors duration-200 hover:text-cyan"
            >
              The Studio
            </Link>
            <Link
              href="/system"
              className="font-medium tracking-wide text-sm text-text-muted transition-colors duration-200 hover:text-cyan"
            >
              The System
            </Link>
            <Link
              href="/docs"
              className="font-medium tracking-wide text-sm text-text-muted transition-colors duration-200 hover:text-lime"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="font-medium tracking-wide text-sm text-text-muted transition-colors duration-200 hover:text-amber"
            >
              Pricing
            </Link>
            <Link
              href="/portfolio"
              className="font-medium tracking-wide text-sm text-text-muted transition-colors duration-200 hover:text-pink"
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
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isMenuOpen}
              className="p-2.5 -mr-1 text-text-muted transition duration-200 rounded-lg hover:bg-surface-2 hover:text-text focus:outline-none focus:ring-2 focus:ring-cyan"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5h18a1 1 0 010 2H3a1 1 0 010-2zm0 6h18a1 1 0 010 2H3a1 1 0 010-2zm0 6h18a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div ref={menuRef} className="lg:hidden border-b border-border bg-surface px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/studio"
              className="font-medium text-text-muted hover:text-cyan py-1"
              onClick={closeMenu}
            >
              The Studio
            </Link>
            <Link
              href="/system"
              className="font-medium text-text-muted hover:text-cyan py-1"
              onClick={closeMenu}
            >
              The System
            </Link>
            <Link
              href="/docs"
              className="font-medium text-text-muted hover:text-lime py-1"
              onClick={closeMenu}
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="font-medium text-text-muted hover:text-amber py-1"
              onClick={closeMenu}
            >
              Pricing
            </Link>
            <Link
              href="/portfolio"
              className="font-medium text-text-muted hover:text-pink py-1"
              onClick={closeMenu}
            >
              Portfolio
            </Link>
          </nav>
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <AuthActions authenticated={authenticated} userEmail={userEmail} />
          </div>
        </div>
      )}
    </header>
  );
}
