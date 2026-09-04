"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { StudioLogo } from "@/components/shell/studio-logo";

type AccountDropdownProps = Readonly<{
  userEmail?: string;
  studioName?: string;
  studioLogoUrl?: string | null;
}>;

export function AccountDropdown({ userEmail, studioName = "Studio", studioLogoUrl }: AccountDropdownProps) {
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
        className="account-dropdown-trigger flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <StudioLogo studioName={studioName} logoUrl={studioLogoUrl} size={20} />
        <span className="account-dropdown-label max-w-[130px] truncate">{studioName}</span>
        <span className="account-dropdown-chevron" aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div ref={menuRef} id="account-menu" role="menu" className="account-dropdown-menu">
          <div className="flex items-center gap-3 p-3 border-b border-hairline bg-surface-2/40 rounded-t-sm" role="presentation">
            <StudioLogo studioName={studioName} logoUrl={studioLogoUrl} size={32} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-semibold text-text truncate">{studioName}</div>
              {userEmail ? <div className="font-mono text-[11px] text-text-faint truncate">{userEmail}</div> : null}
            </div>
          </div>
          <div className="account-dropdown-group" role="group" aria-label="Profile">
            <Link role="menuitem" href="/account" onClick={close}>Profile</Link>
            <Link role="menuitem" href="/account#settings" onClick={close}>Settings</Link>
          </div>
          <div className="account-dropdown-group" role="group" aria-label="Billing">
            <Link role="menuitem" href="/app/billing" onClick={close}>Billing</Link>
            <Link role="menuitem" href="/app/billing#subscription" onClick={close}>Subscription</Link>
            <Link role="menuitem" href="/app/billing#credits" onClick={close}>Credits</Link>
          </div>
          <div className="account-dropdown-group account-dropdown-signout" role="group" aria-label="Session">
            <button role="menuitem" type="button" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
