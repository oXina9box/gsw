"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

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
    <button className="button button-outline command-pill" type="button" onClick={open} ref={triggerRef}><span>Explore</span><kbd>⌘ K</kbd></button>
    <dialog className="command-dialog" ref={dialogRef} aria-modal="true" onClick={(event) => { if (event.target === event.currentTarget) close(); }} onClose={() => triggerRef.current?.focus()}>
      <div className="dialog-topline"><span>Navigate the studio</span><button className="dialog-close" type="button" onClick={close} aria-label="Close command menu">×</button></div>
      <nav className="command-list" aria-label="Quick navigation">
        <Link href={authenticated ? "/app" : "/signup"} onClick={close}><span>G</span><span>{authenticated ? "Open your Studio" : "Create your Studio"}</span><span>↗</span></Link>
        <Link href="/studio" onClick={close}><span>S</span><span>Walk the studio floor</span><span>↗</span></Link>
        <Link href="/system" onClick={close}><span>H</span><span>See the handoff system</span><span>↗</span></Link>
        <Link href="/social-workshop" onClick={close}><span>W</span><span>Open the social workshop</span><span>↗</span></Link>
      </nav>
    </dialog>
  </>;
}
