"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GemLogo } from "@/components/shell/gem-brand-icon";
import { StudioLogo } from "@/components/shell/studio-logo";
import { AccountDropdown } from "@/components/shell/account-dropdown";
import { CommandMenu } from "@/components/shell/command-menu";
import { NAV_GROUPS, navItemIsActive, type NavItem } from "@/lib/studio/navigation";
import { CloseIcon, DocsIcon, HelpIcon, MenuIcon } from "@/components/product/shell-icons";

type StudioShellProps = Readonly<{
  studioName: string;
  studioLogoUrl?: string | null;
  userEmail?: string;
  orchestrationEnabled: boolean;
  children: React.ReactNode;
}>;

const ITEM_CLASSES = "flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-sm text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3";

export function StudioShell({ studioName, studioLogoUrl, userEmail, orchestrationEnabled, children }: StudioShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-sm p-2 text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text active:bg-surface-3"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <Link href="/app" aria-label="Gem Studio" className="rounded-sm transition-opacity duration-150 hover:opacity-80">
            <GemLogo width={96} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <CommandMenu authenticated />
            <AccountDropdown userEmail={userEmail} />
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
        className={`fixed left-0 top-14 bottom-0 z-40 w-64 border-r border-hairline bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="studio-sidenav-scroll flex h-full flex-col overflow-y-auto px-3 py-4">
          <div className="mb-4 flex items-center gap-2 rounded-md border border-border-2 bg-surface-2 p-2.5">
            <StudioLogo studioName={studioName} logoUrl={studioLogoUrl} size={32} />
            <div className="min-w-0">
              <span className="block truncate font-mono text-xs text-text">{studioName}</span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-text-faint">Studio</span>
            </div>
          </div>
          <nav aria-label="Studio modules">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-2 pb-1.5 pt-4 font-mono text-[10px] uppercase tracking-wider text-text-faint">{group.label}</p>
                <ul className="space-y-1">
                  {group.items
                    .filter((item) => item.href !== "/app/orchestration" || orchestrationEnabled)
                    .map((item) => (
                      <li key={item.href}>{itemLink(item)}</li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="mt-auto space-y-1 border-t border-hairline pt-3">
            {itemLink({ label: "Docs", href: "/docs" }, <DocsIcon className="h-5 w-5 shrink-0" />)}
            {itemLink({ label: "Help", href: "/contact" }, <HelpIcon className="h-5 w-5 shrink-0" />)}
          </div>
        </div>
      </aside>

      <main id="main-content" className="studio-main pt-14 md:pl-64">{children}</main>
    </>
  );
}
