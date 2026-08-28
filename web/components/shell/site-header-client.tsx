"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AuthActions } from "./auth-actions";
import { GemLogo } from "./gem-brand-icon";

export function SiteHeaderClient({ authenticated, userEmail }: { authenticated: boolean; userEmail?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
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
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return <header className="site-header shell">
    <Link className="wordmark" href={authenticated ? "/app" : "/"} aria-label={authenticated ? "Open Gem Studio" : "Gem Studio home"} onClick={closeMenu}><GemLogo width={118} /></Link>
    <nav ref={menuRef} className={`main-nav ${menuOpen ? "is-open" : ""}`} id="main-nav" aria-label="Primary navigation">
      <Link href="/portfolio" onClick={closeMenu}>Portfolio</Link><Link href="/docs" onClick={closeMenu}>Docs</Link><Link href="/pricing" onClick={closeMenu}>Pricing</Link>
      <div className="mobile-account-actions"><AuthActions authenticated={authenticated} userEmail={userEmail} /></div>
    </nav>
    <div className="header-actions"><div className="desktop-account-actions"><AuthActions authenticated={authenticated} userEmail={userEmail} /></div><button ref={toggleRef} className={`menu-toggle ${menuOpen ? "is-open" : ""}`} type="button" aria-controls="main-nav" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button></div>
  </header>;
}
