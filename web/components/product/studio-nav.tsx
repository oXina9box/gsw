"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, navGroupForPath, navItemIsActive } from "@/lib/studio/navigation";
import { AccountDropdown } from "@/components/shell/account-dropdown";
import { GemLogo } from "@/components/shell/gem-brand-icon";
import { StudioLogo } from "@/components/shell/studio-logo";

export function StudioNav({ studioName, studioLogoUrl, userEmail, orchestrationEnabled }: { studioName: string; studioLogoUrl?: string | null; userEmail?: string; orchestrationEnabled: boolean }) {
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
          <StudioLogo studioName={studioName} logoUrl={studioLogoUrl} size={28} />
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
