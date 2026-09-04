"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GemLogo } from "@/components/shell/gem-brand-icon";
import { AccountDropdown } from "@/components/shell/account-dropdown";
import { ModulesDropdown } from "@/components/shell/modules-dropdown";
import { CommandMenu } from "@/components/shell/command-menu";
import { NotificationBell, type NotificationRecord } from "@/components/product/notification-bell";
import { STUDIO_MODULE, navItemIsActive, type NavItem } from "@/lib/studio/navigation";
import { ChevronDownIcon, CloseIcon, DocsIcon, HelpIcon, MenuIcon } from "@/components/product/shell-icons";

export type ChannelSummary = Readonly<{ id: string; name: string; status: string; is_brand?: boolean }>;

const CHANNEL_SUBPAGES = [
  { label: "Dashboard", subpath: "" },
  { label: "Staffing", subpath: "/staffing" },
  { label: "Marketing", subpath: "/marketing" },
  { label: "Social Media", subpath: "/social" },
  { label: "Assets", subpath: "/assets" },
  { label: "Production", subpath: "/production" },
] as const;

type StudioShellProps = Readonly<{
  studioName: string;
  studioLogoUrl?: string | null;
  userEmail?: string;
  orchestrationEnabled: boolean;
  channels: readonly ChannelSummary[];
  notifications?: readonly NotificationRecord[];
  children: React.ReactNode;
}>;

const ITEM_CLASSES = "flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-sm text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3";

export function StudioShell({ studioName, studioLogoUrl, userEmail, orchestrationEnabled, channels, notifications = [], children }: StudioShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});
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

  const itemLink = (item: NavItem, icon?: React.ReactNode) => {
    const active = navItemIsActive(pathname, item);
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`${ITEM_CLASSES}${active ? " bg-pink/10 text-text font-medium" : ""}`}
      >
        <span aria-hidden="true" className={`h-4 w-0.5 rounded-full ${active ? "bg-pink" : "bg-transparent"}`} />
        {icon}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

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
            <ul className="space-y-1">
              {STUDIO_MODULE.items
                .filter((item) => item.href !== "/app/orchestration" || orchestrationEnabled)
                .map((item) => (
                  <li key={item.href}>{itemLink(item)}</li>
                ))}
              {channels.length > 0 ? (
                <>
                  <li aria-hidden="true" className="px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-wider text-text-faint">Channels</li>
                  {channels.map((channel) => {
                    const href = `/app/channels/${channel.id}`;
                    const isChannelActive = pathname === href || pathname.startsWith(`${href}/`);
                    const isExpanded = expandedChannels[channel.id] ?? isChannelActive;
                    const toggleExpand = (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedChannels((prev) => ({
                        ...prev,
                        [channel.id]: !(prev[channel.id] ?? isChannelActive),
                      }));
                    };
                    return (
                      <li key={channel.id} className="space-y-0.5">
                        <div className="flex items-center gap-1 group">
                          <Link
                            href={href}
                            aria-current={pathname === href ? "page" : undefined}
                            className={`flex-1 flex items-center gap-2.5 rounded-sm px-3 py-2 font-mono text-sm text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3 ${
                              isChannelActive ? " bg-surface-2 text-text font-medium" : ""
                            }`}
                          >
                            <span aria-hidden="true" className={`h-4 w-0.5 rounded-full ${isChannelActive ? "bg-pink" : "bg-transparent"}`} />
                            <span className="truncate">{channel.name}</span>
                            {channel.is_brand ? (
                              <span className="ml-1 rounded bg-pink/20 px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pink font-semibold">
                                Brand
                              </span>
                            ) : null}
                            <span className="ml-auto font-mono text-[10px] text-text-faint">{channel.status}</span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`Toggle ${channel.name} subpages`}
                            aria-expanded={isExpanded}
                            onClick={toggleExpand}
                            className="p-2 rounded-sm text-text-faint hover:text-text hover:bg-surface-2 transition-colors"
                          >
                            <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180 text-text" : ""}`} />
                          </button>
                        </div>
                        {isExpanded ? (
                          <ul className="ml-5 space-y-0.5 border-l border-border-2 pl-2">
                            {CHANNEL_SUBPAGES.map((sub) => {
                              const subHref = `${href}${sub.subpath}`;
                              const isSubActive = sub.subpath === "" ? pathname === href : pathname === subHref || pathname.startsWith(`${subHref}/`);
                              return (
                                <li key={sub.label}>
                                  <Link
                                    href={subHref}
                                    aria-current={isSubActive ? "page" : undefined}
                                    className={`flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-xs transition-colors duration-150 ${
                                      isSubActive
                                        ? "text-pink font-semibold bg-pink/10"
                                        : "text-text-muted hover:text-text hover:bg-surface-2"
                                    }`}
                                  >
                                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isSubActive ? "bg-pink" : "bg-transparent"}`} />
                                    <span className="truncate">{sub.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </>
              ) : null}
            </ul>
          </nav>

          <div className="mt-auto space-y-1 border-t border-hairline pt-3">
            {itemLink({ label: "Docs", href: "/docs" }, <DocsIcon className="h-5 w-5 shrink-0" />)}
            {itemLink({ label: "Help", href: "/contact" }, <HelpIcon className="h-5 w-5 shrink-0" />)}
            <Link href="/contact" className={`${ITEM_CLASSES} pl-6`}>
              <span aria-hidden="true" className="h-4 w-0.5 rounded-full bg-transparent" />
              <span className="truncate">Contact</span>
            </Link>
          </div>
        </div>
      </aside>

      <main id="main-content" className={`studio-main pt-14 transition-all duration-300 ${desktopCollapsed ? "md:pl-0" : "md:pl-64"}`}>{children}</main>
    </>
  );
}
