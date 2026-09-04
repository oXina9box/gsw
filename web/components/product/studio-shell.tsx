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
  ChannelIcon,
  ChartIcon,
  CloseIcon,
  DashboardIcon,
  DocsIcon,
  HelpIcon,
  KeyIcon,
  MarketingIcon,
  MenuIcon,
  PlugIcon,
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

  // Active module resolution based on pathname
  let activeModuleTitle = "Studio Reports";
  let moduleCategory = "Reports";
  let navItems: readonly { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  const brandChannel = channels.find((c) => c.is_brand);
  const matchedChannel = channels.find((c) => pathname.startsWith(`/app/channels/${c.id}`));

  if (pathname.startsWith("/app/integrations")) {
    activeModuleTitle = "Integrations";
    moduleCategory = "Connected";
    navItems = [
      { label: "Connected Apps", href: "/app/integrations", icon: PlugIcon },
      { label: "Git Repositories", href: "/app/integrations#github", icon: WorkflowIcon },
      { label: "AI & OAuths", href: "/app/integrations#oauths", icon: KeyIcon },
    ];
  } else if (pathname.startsWith("/app/secrets")) {
    activeModuleTitle = "Secrets";
    moduleCategory = "Security";
    navItems = [
      { label: "Key Vault", href: "/app/secrets", icon: KeyIcon },
      { label: "BYOK Encryption", href: "/app/secrets#byok", icon: PlugIcon },
    ];
  } else if (pathname === "/app/collective") {
    activeModuleTitle = "Studio Reports";
    moduleCategory = "Reports";
    navItems = [
      { label: "Overview", href: "/app/collective", icon: ChartIcon },
      { label: "Channels Rollup", href: "/app/channels", icon: ChannelIcon },
    ];
  } else if (pathname.startsWith("/app/onboarding") || (matchedChannel && matchedChannel.is_brand)) {
    // Studio Branding
    const ch = matchedChannel?.is_brand ? matchedChannel : (brandChannel ?? channels[0]);
    activeModuleTitle = "Studio Branding";
    moduleCategory = "Branding";
    navItems = [
      { label: "Dashboard", href: ch ? `/app/channels/${ch.id}` : "/app", icon: DashboardIcon },
      { label: "Channel Staffing", href: ch ? `/app/channels/${ch.id}/staffing` : "/app/staffing", icon: StaffingIcon },
      { label: "Marketing", href: ch ? `/app/channels/${ch.id}/marketing` : "/app/marketing", icon: MarketingIcon },
      { label: "Social Media", href: ch ? `/app/channels/${ch.id}/social` : "/app/social", icon: SocialIcon },
      { label: "Assets", href: ch ? `/app/channels/${ch.id}/assets` : "/app/assets", icon: AssetsIcon },
      { label: "Production", href: ch ? `/app/channels/${ch.id}/production` : "/app/orchestration", icon: WorkflowIcon },
    ];
  } else {
    // Active Channel (e.g. sadf, Channel 1, etc.)
    const ch = matchedChannel ?? channels[0];
    activeModuleTitle = ch ? ch.name : "Channel";
    moduleCategory = "Channel";
    navItems = [
      { label: "Dashboard", href: ch ? `/app/channels/${ch.id}` : "/app", icon: DashboardIcon },
      { label: "Channel Staffing", href: ch ? `/app/channels/${ch.id}/staffing` : "/app/staffing", icon: StaffingIcon },
      { label: "Marketing", href: ch ? `/app/channels/${ch.id}/marketing` : "/app/marketing", icon: MarketingIcon },
      { label: "Social Media", href: ch ? `/app/channels/${ch.id}/social` : "/app/social", icon: SocialIcon },
      { label: "Assets", href: ch ? `/app/channels/${ch.id}/assets` : "/app/assets", icon: AssetsIcon },
      { label: "Production", href: ch ? `/app/channels/${ch.id}/production` : "/app/orchestration", icon: WorkflowIcon },
    ];
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-hairline bg-bg/92 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4">
          <Link href="/app" aria-label="Gem Studio" className="rounded-sm transition-opacity duration-150 hover:opacity-80">
            <GemLogo width={96} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
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
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
            <div className="min-w-0 flex-1 pr-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint block leading-none mb-1">
                {moduleCategory}
              </span>
              <h2 className="font-mono text-sm font-semibold text-text truncate">
                {activeModuleTitle}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-controls="studio-sidenav"
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth >= 768) {
                  setDesktopCollapsed(true);
                } else {
                  setOpen(false);
                }
              }}
              className="rounded-sm p-1.5 text-text-faint hover:text-text hover:bg-surface-2 transition-colors"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {matchedChannel && channels.length > 1 ? (
            <div className="mb-3 pb-3 border-b border-hairline space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint px-1 block">
                Switch Channel
              </span>
              <div className="space-y-0.5">
                {channels.filter((c) => c.id !== matchedChannel.id).map((other) => (
                  <Link
                    key={other.id}
                    href={`/app/channels/${other.id}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-sm text-text-muted hover:text-text hover:bg-surface-2 font-mono text-xs transition-colors truncate"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-border-2 shrink-0" />
                    <span className="truncate">{other.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <nav aria-label="Studio modules" className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isSubActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(`${item.href}/`));
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

          <div className="mt-auto pt-3">
            <div className="mb-3 px-0.5">
              <CommandMenu
                authenticated
                className="flex w-full items-center gap-2 rounded-sm border border-border bg-surface-2/40 px-2.5 py-1.5 font-mono text-xs text-text-muted transition-colors duration-150 hover:border-border-2 hover:text-text"
              />
            </div>
            <div className="space-y-1 border-t border-hairline pt-3">
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
        </div>
      </aside>
      {desktopCollapsed ? (
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-controls="studio-sidenav"
          onClick={() => setDesktopCollapsed(false)}
          className="fixed left-3 top-16 z-40 flex items-center gap-1.5 rounded-sm bg-surface border border-border px-2.5 py-1.5 font-mono text-xs text-text-muted hover:text-text shadow-lg hover:border-border-2 transition-all"
        >
          <MenuIcon className="h-4 w-4" />
          <span className="font-mono text-[10px] uppercase font-semibold">Nav</span>
        </button>
      ) : null}
      {!open ? (
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-controls="studio-sidenav"
          onClick={() => setOpen(true)}
          className="md:hidden fixed left-3 top-16 z-40 flex items-center gap-1.5 rounded-sm bg-surface border border-border p-2 text-text-muted hover:text-text shadow-lg transition-all"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      ) : null}
      <main id="main-content" className={`studio-main pt-14 transition-all duration-300 ${desktopCollapsed ? "md:pl-0" : "md:pl-64"}`}>{children}</main>
    </>
  );
}
