"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AuthActions } from "./auth-actions";
import { CommandMenu } from "./command-menu";

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
    <Link className="wordmark" href="/" aria-label="Gem Studio home" onClick={closeMenu}><span className="gem-brand-mark" aria-hidden="true">✦</span><span>GEM STUDIO</span></Link>
    <nav ref={menuRef} className={`main-nav ${menuOpen ? "is-open" : ""}`} id="main-nav" aria-label="Primary navigation">
      <Link href="/#studio" onClick={closeMenu}>The studio</Link><Link href="/#system" onClick={closeMenu}>The system</Link>
      <div className="mobile-account-actions"><AuthActions authenticated={authenticated} userEmail={userEmail} /></div>
    </nav>
    <div className="header-actions"><div className="desktop-account-actions"><AuthActions authenticated={authenticated} userEmail={userEmail} /></div><CommandMenu authenticated={authenticated} /><button ref={toggleRef} className={`menu-toggle ${menuOpen ? "is-open" : ""}`} type="button" aria-controls="main-nav" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button></div>
  </header>;
}
