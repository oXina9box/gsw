"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type AccountDropdownProps = Readonly<{
  userEmail?: string;
}>;

export function AccountDropdown({ userEmail }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); (last as HTMLElement).focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); (first as HTMLElement).focus(); }
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const close = () => setOpen(false);

  const signOut = async () => {
    close();
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="account-dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="account-dropdown-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-dropdown-label">Account</span>
        <span className="account-dropdown-chevron" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div ref={menuRef} id="account-menu" role="menu" className="account-dropdown-menu">
          {userEmail ? <div className="account-dropdown-email" aria-hidden="true">{userEmail}</div> : null}

          <div className="account-dropdown-group" role="group" aria-label="Profile">
            <Link role="menuitem" href="/account" onClick={close}>Profile</Link>
            <Link role="menuitem" href="/account#settings" onClick={close}>Settings</Link>
          </div>

          <div className="account-dropdown-group" role="group" aria-label="Integrations">
            <span className="account-dropdown-group-label">Integrations</span>
            <Link role="menuitem" href="/app/integrations#github" onClick={close}>GitHub</Link>
            <Link role="menuitem" href="/app/integrations#gitlab" onClick={close}>GitLab</Link>
            <Link role="menuitem" href="/app/integrations#gitkraken" onClick={close}>GitKraken</Link>
            <Link role="menuitem" href="/app/integrations#oauths" onClick={close}>OAuths</Link>
            <Link role="menuitem" href="/app/integrations#apis" onClick={close}>APIs</Link>
          </div>

          <div className="account-dropdown-group" role="group" aria-label="Billing">
            <span className="account-dropdown-group-label">Billing</span>
            <Link role="menuitem" href="/app/billing" onClick={close}>Billing</Link>
            <Link role="menuitem" href="/app/billing#subscription" onClick={close}>Subscription</Link>
            <Link role="menuitem" href="/app/billing#credits" onClick={close}>Credits</Link>
            <Link role="menuitem" href="/app/billing#add-more" onClick={close}>Add more</Link>
            <Link role="menuitem" href="/app/billing#payment" onClick={close}>Payment</Link>
          </div>

          <div className="account-dropdown-group account-dropdown-signout" role="group" aria-label="Session">
            <button role="menuitem" type="button" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
