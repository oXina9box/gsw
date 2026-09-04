"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AppsIcon,
  ChartIcon,
  PaletteIcon,
  ChannelIcon,
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

  const brandChannel = channels.find((c) => c.is_brand);

  const items = [
    {
      name: "Studio Reports",
      href: "/app/collective",
      icon: ChartIcon,
      accent: "text-pink",
    },
    {
      name: "Studio Branding",
      href: brandChannel ? `/app/channels/${brandChannel.id}` : "/app/onboarding",
      icon: PaletteIcon,
      accent: "text-cyan",
    },
    ...(channels.length > 0
      ? channels.map((ch) => ({
          name: ch.name,
          href: `/app/channels/${ch.id}`,
          icon: ChannelIcon,
          accent: "text-lime",
        }))
      : [
          {
            name: "Channels",
            href: "/app/channels",
            icon: ChannelIcon,
            accent: "text-lime",
          },
        ]),
    {
      name: "Integrations",
      href: "/app/integrations",
      icon: PlugIcon,
      accent: "text-cyan",
    },
    {
      name: "Secrets",
      href: "/app/secrets",
      icon: KeyIcon,
      accent: "text-amber",
    },
  ];

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
          aria-label="Studio Modules"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-96 max-w-[95vw] rounded-sm border border-border-2 bg-surface shadow-2xl p-4"
        >
          <div className="pb-2.5 px-1 border-b border-hairline">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
              Studio Modules
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="group flex flex-col items-center justify-center text-center p-3 rounded-sm border border-border/50 bg-surface-2/40 transition-all duration-150 hover:border-cyan hover:bg-surface-2"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-surface group-hover:bg-surface-3 transition-colors">
                    <Icon className={`h-5 w-5 ${item.accent} transition-transform duration-150 group-hover:scale-110`} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-text leading-tight group-hover:text-pink transition-colors text-center">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
