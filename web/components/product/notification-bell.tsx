"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/product/shell-icons";
import { markNotificationsReadAction } from "@/app/(product)/actions";

export type NotificationRecord = Readonly<{
  id: string;
  kind: string;
  body: string;
  href?: string | null;
  read_at?: string | null;
  created_at: string;
}>;

type NotificationBellProps = Readonly<{
  notifications?: readonly NotificationRecord[];
}>;

export function NotificationBell({ notifications = [] }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((item) => !item.read_at).length;

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
        className="relative rounded-sm p-2 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pink ring-2 ring-bg" aria-hidden="true" />
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-sm border border-border-2 bg-surface p-3"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="mb-2 flex items-center justify-between border-b border-border-2 pb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-text font-semibold">Notifications</span>
            {unreadCount > 0 ? (
              <form action={markNotificationsReadAction}>
                <button type="submit" className="font-mono text-[10px] text-cyan hover:underline">
                  Mark all read
                </button>
              </form>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <div className="py-4 text-center">
              <p className="font-mono text-xs text-text-muted">No notifications yet.</p>
              <p className="mt-1 text-[11px] text-text-faint">Studio alerts will appear here.</p>
            </div>
          ) : (
            <ul className="max-h-72 divide-y divide-border-2 overflow-y-auto">
              {notifications.map((item) => (
                <li key={item.id} className="py-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block text-text hover:text-cyan"
                    >
                      <p className="font-mono text-xs leading-snug">{item.body}</p>
                      <span className="font-mono text-[10px] text-text-faint">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  ) : (
                    <div>
                      <p className="font-mono text-xs text-text leading-snug">{item.body}</p>
                      <span className="font-mono text-[10px] text-text-faint">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
