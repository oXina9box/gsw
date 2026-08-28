"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, navGroupForPath, navItemIsActive } from "@/lib/studio/navigation";
import { GemMark } from "@/components/shell/gem-brand-icon";

export function StudioNav({ studioName, orchestrationEnabled }: { studioName: string; orchestrationEnabled: boolean }) {
  const pathname = usePathname();
  const group = navGroupForPath(pathname);

  return <header className="studio-header">
    <div className="studio-header-inner shell">
      <Link className="studio-wordmark" href="/app"><GemMark size={22} className="studio-mark" /><span className="studio-name">{studioName}</span></Link>
      <nav className="studio-nav" aria-label="Modules">
        {NAV_GROUPS.map(({ label, href }) => <Link href={href} key={href} aria-current={group.label === label ? "location" : undefined}>{label}</Link>)}
      </nav>
      <div className="studio-header-actions"><Link href="/">Site</Link></div>
    </div>
    <nav className="studio-subnav shell" aria-label={`${group.label} pages`}>
      {group.items.filter((item) => item.href !== "/app/orchestration" || orchestrationEnabled).map((item) => <Link href={item.href} key={item.href} aria-current={navItemIsActive(pathname, item) ? "page" : undefined}>{item.label}</Link>)}
    </nav>
  </header>;
}
