"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GemLogo } from "@/components/shell/gem-brand-icon";
import { AccountDropdown } from "@/components/shell/account-dropdown";
import { ModulesDropdown } from "@/components/shell/modules-dropdown";
import { CommandMenu } from "@/components/shell/command-menu";
import { NotificationBell, type NotificationRecord } from "@/components/product/notification-bell";
import {
  AssetsIcon,
  CloseIcon,
  DashboardIcon,
  DocsIcon,
  HelpIcon,
  MarketingIcon,
  MenuIcon,
  SocialIcon,
  StaffingIcon,
  WorkflowIcon,
} from "@/components/product/shell-icons";

export type ChannelSummary = Readonly<{ id: string; name: string; status: string; is_brand?: boolean }>;

type StudioShellProps = Readonly<{
  studioName: string;
  studioLogoUrl?: string | null;
  userEmail?: string;
  orchestrationEnabled?: boolean;
  channels: readonly ChannelSummary[];
  notifications?: readonly NotificationRecord[];
  children: React.ReactNode;
}>;

const ITEM_CLASSES = "flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-sm text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3";

export function StudioShell({ studioName, studioLogoUrl, userEmail, channels, notifications = [], children }: StudioShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  // Render-time adjustment: close drawer on navigation without an effect
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeChannel = channels.find((c) => pathname.startsWith(`/app/channels/${c.id}`)) ?? channels[0];
  const channelBasePath = activeChannel ? `/app/channels/${activeChannel.id}` : "/app";

  const channelSubpages = [
    { label: "Dashboard", href: channelBasePath, icon: DashboardIcon },
    { label: "Channel Staffing", href: activeChannel ? `${channelBasePath}/staffing` : "/app/staffing", icon: StaffingIcon },
    { label: "Marketing", href: activeChannel ? `${channelBasePath}/marketing` : "/app/marketing", icon: MarketingIcon },
    { label: "Social Media", href: activeChannel ? `${channelBasePath}/social` : "/app/social", icon: SocialIcon },
    { label: "Assets", href: activeChannel ? `${channelBasePath}/assets` : "/app/assets", icon: AssetsIcon },
    { label: "Production", href: activeChannel ? `${channelBasePath}/production` : "/app/orchestration", icon: WorkflowIcon },
  ] as const;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-hairline bg-bg/92 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4">
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-controls="studio-sidenav"
            aria-expanded={open}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth >= 768) {
                setDesktopCollapsed((v) => !v);
              } else {
                setOpen((v) => !v);
              }
            }}
            className="rounded-sm p-2 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <Link href="/app" aria-label="Gem Studio" className="rounded-sm transition-opacity duration-150 hover:opacity-80">
            <GemLogo width={96} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <CommandMenu authenticated />
            <NotificationBell notifications={notifications} />
            <ModulesDropdown channels={channels} />
            <AccountDropdown studioName={studioName} studioLogoUrl={studioLogoUrl} userEmail={userEmail} />
          </div>
        </div>
      </header>
      {open ? (
        <div
          className="studio-drawer-backdrop fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id="studio-sidenav"
        className={`fixed left-0 top-14 bottom-0 z-40 w-64 border-r border-hairline bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${desktopCollapsed ? "md:-translate-x-full" : "md:translate-x-0"}`}
      >
        <div className="studio-sidenav-scroll flex h-full flex-col overflow-y-auto px-3 py-4">
          <nav aria-label="Studio modules">
            {channels.length > 0 && activeChannel ? (
              <div className="mb-4 pb-3 border-b border-hairline">
                <div className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-text-faint flex items-center justify-between">
                  <span>Channel</span>
                  {channels.length > 1 ? (
                    <span className="text-pink font-semibold">{channels.length} channels</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-surface-2/60 border border-border">
                  <span className="h-2 w-2 rounded-full bg-pink shrink-0" />
                  <span className="font-mono text-xs font-semibold text-text truncate flex-1">{activeChannel.name}</span>
                  {activeChannel.is_brand ? (
                    <span className="rounded bg-pink/20 px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pink font-semibold">
                      Brand
                    </span>
                  ) : null}
                  <span className="font-mono text-[10px] text-text-faint">{activeChannel.status}</span>
                </div>
                {channels.length > 1 ? (
                  <div className="mt-1.5 space-y-0.5">
                    {channels.filter((c) => c.id !== activeChannel.id).map((other) => (
                      <Link
                        key={other.id}
                        href={`/app/channels/${other.id}`}
                        className="flex items-center gap-2 px-2 py-1 rounded-sm text-text-faint hover:text-text hover:bg-surface-2 font-mono text-[11px] transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-border-2 shrink-0" />
                        <span className="truncate">{other.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <ul className="space-y-1">
              {channelSubpages.map((item) => {
                const isSubActive = item.label === "Dashboard"
                  ? (activeChannel ? pathname === item.href : pathname === "/app")
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={isSubActive ? "page" : undefined}
                      className={`${ITEM_CLASSES}${isSubActive ? " bg-pink/10 text-pink font-semibold" : ""}`}
                    >
                      <span aria-hidden="true" className={`h-4 w-0.5 rounded-full ${isSubActive ? "bg-pink" : "bg-transparent"}`} />
                      <Icon className={`h-4 w-4 shrink-0 ${isSubActive ? "text-pink" : "text-text-muted"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto space-y-1 border-t border-hairline pt-3">
            <Link href="/docs" className={ITEM_CLASSES}>
              <span aria-hidden="true" className="h-4 w-0.5 rounded-full bg-transparent" />
              <DocsIcon className="h-5 w-5 shrink-0 text-text-muted" />
              <span className="truncate">Docs</span>
            </Link>
            <Link href="/contact" className={ITEM_CLASSES}>
              <span aria-hidden="true" className="h-4 w-0.5 rounded-full bg-transparent" />
              <HelpIcon className="h-5 w-5 shrink-0 text-text-muted" />
              <span className="truncate">Help</span>
            </Link>
          </div>
        </div>
      </aside>

      <main id="main-content" className={`studio-main pt-14 transition-all duration-300 ${desktopCollapsed ? "md:pl-0" : "md:pl-64"}`}>{children}</main>
    </>
  );
}
