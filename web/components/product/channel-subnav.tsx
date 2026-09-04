import Link from "next/link";

export type ChannelTab = "dashboard" | "staffing" | "marketing" | "social" | "assets" | "production";

type ChannelSubnavProps = Readonly<{
  channelId: string;
  activeTab: ChannelTab;
}>;

const TABS: readonly { id: ChannelTab; label: string; subpath: string }[] = [
  { id: "dashboard", label: "Dashboard", subpath: "" },
  { id: "staffing", label: "Staffing", subpath: "/staffing" },
  { id: "marketing", label: "Marketing", subpath: "/marketing" },
  { id: "social", label: "Social Media", subpath: "/social" },
  { id: "assets", label: "Assets", subpath: "/assets" },
  { id: "production", label: "Production", subpath: "/production" },
];

export function ChannelSubnav({ channelId, activeTab }: ChannelSubnavProps) {
  return (
    <nav aria-label="Channel sections" className="mb-6 border-b border-border">
      <ul className="flex flex-wrap gap-2 -mb-px font-mono text-xs">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const href = `/app/channels/${channelId}${tab.subpath}`;
          return (
            <li key={tab.id}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 transition-colors ${
                  isActive
                    ? "border-pink text-text font-semibold"
                    : "border-transparent text-text-muted hover:border-border hover:text-text"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
