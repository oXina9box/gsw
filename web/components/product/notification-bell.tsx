"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/product/shell-icons";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-sm p-2 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
      >
        <BellIcon className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-72 rounded-sm border border-border-2 bg-surface p-4" role="dialog" aria-label="Notifications">
          <p className="font-mono text-xs text-text-muted">No notifications yet.</p>
          <p className="mt-1 text-xs text-text-faint">The global feed lands in the next milestone.</p>
        </div>
      ) : null}
    </div>
  );
}
