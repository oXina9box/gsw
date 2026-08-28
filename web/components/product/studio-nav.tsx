"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, navGroupForPath, navItemIsActive } from "@/lib/studio/navigation";
import { AccountDropdown } from "@/components/shell/account-dropdown";
import { GemLogo, GemMark } from "@/components/shell/gem-brand-icon";

export function StudioNav({ studioName, userEmail, orchestrationEnabled }: { studioName: string; userEmail?: string; orchestrationEnabled: boolean }) {
  const pathname = usePathname();
  const group = navGroupForPath(pathname);

  return <header className="studio-header">
    <div className="studio-header-inner shell">
      <Link className="wordmark header-brand" href="/app" aria-label="Gem Studio"><GemLogo width={132} /></Link>
      <nav className="studio-nav" aria-label="Modules">
        {NAV_GROUPS.map(({ label, href }) => <Link href={href} key={href} aria-current={group.label === label ? "location" : undefined}>{label}</Link>)}
      </nav>
      <div className="studio-header-actions">
        <div className="studio-identity" aria-label={`Studio ${studioName}`}>
          <GemMark size={18} className="studio-identity-mark" />
          <span className="studio-identity-name">{studioName}</span>
        </div>
        <AccountDropdown userEmail={userEmail} />
      </div>
    </div>
    <nav className="studio-subnav shell" aria-label={`${group.label} pages`}>
      {group.items.filter((item) => item.href !== "/app/orchestration" || orchestrationEnabled).map((item) => <Link href={item.href} key={item.href} aria-current={navItemIsActive(pathname, item) ? "page" : undefined}>{item.label}</Link>)}
    </nav>
  </header>;
}
