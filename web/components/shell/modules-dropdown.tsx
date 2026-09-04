"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AppsIcon,
  ChartIcon,
  PaletteIcon,
  ChannelIcon,
  WorkflowIcon,
  PlugIcon,
  KeyIcon,
} from "@/components/product/shell-icons";

type ChannelItem = Readonly<{
  id: string;
  name: string;
  status: string;
  is_brand?: boolean;
}>;

type ModulesDropdownProps = Readonly<{
  channels?: readonly ChannelItem[];
}>;

const MODULE_ITEMS = [
  {
    name: "Studio Reports",
    href: "/app/collective",
    subtext: "Stats Rollup",
    icon: ChartIcon,
    accent: "text-pink",
  },
  {
    name: "Studio Branding",
    href: "/app/onboarding",
    subtext: "Identity & Profile",
    icon: PaletteIcon,
    accent: "text-cyan",
  },
  {
    name: "Channels",
    href: "/app/channels",
    subtext: "Show Slates",
    icon: ChannelIcon,
    accent: "text-lime",
  },
  {
    name: "Production",
    href: "/app/orchestration",
    subtext: "13-Stage Canvas",
    icon: WorkflowIcon,
    accent: "text-pink",
  },
  {
    name: "Integrations",
    href: "/app/integrations",
    subtext: "GitHub & AI",
    icon: PlugIcon,
    accent: "text-cyan",
  },
  {
    name: "Secrets",
    href: "/app/secrets",
    subtext: "BYOK Vault",
    icon: KeyIcon,
    accent: "text-amber",
  },
] as const;

export function ModulesDropdown({ channels = [] }: ModulesDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={rootRef} aria-label="Modules">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="modules-menu"
        aria-label="Studio Modules"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-sm p-1.5 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
      >
        <AppsIcon className="h-5 w-5 text-text-muted transition-colors hover:text-text" />
        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider font-semibold text-text">
          Studio
        </span>
        <span className="text-[9px] text-text-faint" aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          id="modules-menu"
          role="dialog"
          aria-label="Studio Applications and Modules"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-80 max-w-[90vw] rounded-sm border border-border-2 bg-surface shadow-2xl p-3 divide-y divide-hairline"
        >
          <div className="pb-2.5 px-1 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
              Studio Modules
            </span>
            <span className="font-mono text-[10px] text-text-faint">
              Applications
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3">
            {MODULE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="group flex flex-col items-center text-center p-2.5 rounded-sm border border-transparent transition-all duration-150 hover:border-border-2 hover:bg-surface-2"
                >
                  <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-sm bg-surface-2 group-hover:bg-surface-3 transition-colors">
                    <Icon className={`h-5 w-5 ${item.accent} transition-transform duration-150 group-hover:scale-110`} />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-text leading-tight group-hover:text-pink transition-colors">
                    {item.name}
                  </span>
                  <span className="font-mono text-[9px] text-text-faint mt-0.5 leading-none">
                    {item.subtext}
                  </span>
                </Link>
              );
            })}
          </div>

          {channels.length > 0 ? (
            <div className="pt-2.5 px-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  Active Channels
                </span>
                <Link
                  href="/app/channels"
                  onClick={close}
                  className="font-mono text-[10px] text-cyan hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-1 pt-1">
                {channels.slice(0, 4).map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/app/channels/${ch.id}`}
                    onClick={close}
                    className="flex items-center gap-2 rounded-sm px-2 py-1 text-left font-mono text-xs text-text-muted hover:bg-surface-2 hover:text-text transition-colors truncate"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-pink shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
