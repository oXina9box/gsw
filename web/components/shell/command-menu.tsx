"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MODULES } from "@/lib/studio/navigation";
import { SearchIcon } from "@/components/product/shell-icons";

export function CommandMenu({ authenticated }: { authenticated: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLAnchorElement>("a")?.focus());
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close(); else open();
      }

      if (event.key === "Escape" && dialogRef.current?.open) {
        event.preventDefault();
        close();
      }

      if (event.key === "Tab" && dialogRef.current?.open) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
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
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return <>
    <button
      type="button"
      onClick={open}
      ref={triggerRef}
      className="hidden md:flex w-64 lg:w-80 items-center gap-2 rounded-sm border border-border-2 bg-surface px-3 py-2 font-mono text-xs text-text-muted transition-colors duration-150 hover:border-cyan hover:text-text"
    >
      <SearchIcon className="h-4 w-4" />
      <span>Search</span>
      <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] text-text-faint">⌘K</kbd>
    </button>
    <button
      type="button"
      onClick={open}
      aria-label="Search"
      className="md:hidden rounded-sm p-2 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
    >
      <SearchIcon className="h-5 w-5" />
    </button>
    <dialog
      className="command-dialog"
      ref={dialogRef}
      aria-modal="true"
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      onClose={() => triggerRef.current?.focus()}
    >
      <div className="dialog-topline"><span>{authenticated ? "Navigate the studio" : "Explore Gem Studio"}</span><button className="dialog-close" type="button" onClick={close} aria-label="Close command menu">×</button></div>
      <nav className="command-list" aria-label="Quick navigation">
        {authenticated
          ? MODULES.flatMap((module) => module.items.map((item) => (
              <Link key={item.href} href={item.href} onClick={close}><span className="span-2">{module.label} · {item.label}</span><span>↗</span></Link>
            )))
          : <>
              <Link href={"/?auth=signup"} onClick={close}><span className="span-2">Create your Studio</span><span>↗</span></Link>
              <Link href="/studio" onClick={close}><span className="span-2">Walk the studio floor</span><span>↗</span></Link>
              <Link href="/system" onClick={close}><span className="span-2">See the handoff system</span><span>↗</span></Link>
              <Link href="/social-workshop" onClick={close}><span className="span-2">Open the social workshop</span><span>↗</span></Link>
            </>}
      </nav>
    </dialog>
  </>;
}
