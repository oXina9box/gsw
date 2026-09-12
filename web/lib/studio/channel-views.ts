export const CHANNEL_PAGE_IDS = [
  "dashboard",
  "staffing",
  "marketing",
  "social",
  "assets",
  "production",
] as const;

export type ChannelPageId = (typeof CHANNEL_PAGE_IDS)[number];

export type ChannelView = Readonly<{
  id: string;
  label: string;
}>;

export const CHANNEL_VIEW_REGISTRY: Readonly<Record<ChannelPageId, readonly ChannelView[]>> = {
  dashboard: [],
  staffing: [
    { id: "hired", label: "Hired agents - Channel" },
    { id: "hire", label: "Agents for hire" },
    { id: "custom", label: "Custom Agents" },
  ],
  marketing: [
    { id: "onboarding", label: "01 Directives & Onboarding" },
    { id: "research", label: "02 Research Hub" },
    { id: "budgets", label: "03 Budgets & Credits" },
    { id: "website", label: "05 Website & Funnels" },
    { id: "advertising", label: "06 Advertising & Campaigns" },
    { id: "promos", label: "09 Promos & Teasers" },
    { id: "legal", label: "13 Legal & Rights" },
    { id: "values", label: "14 Core Values & Guardrails" },
    { id: "scheduling", label: "07 Master Scheduling" },
    { id: "theming", label: "08 Season Theming & Arcs" },
    { id: "crosschannel", label: "10 Cross-Channel Synergy" },
    { id: "lore", label: "12 Lore & World Bible" },
    { id: "merchandise", label: "04 Merchandise Desk" },
    { id: "reporting", label: "11 Reporting Rollup" },
    { id: "stage-floor", label: "Marketing Stage Floor" },
  ],
  social: [
    { id: "youtube", label: "YouTube" },
    { id: "tiktok", label: "Tik-Tok" },
    { id: "x", label: "X" },
    { id: "instagram", label: "Instagram" },
    { id: "facebook", label: "Facebook" },
    { id: "telegram", label: "Telegram" },
    { id: "discord", label: "Discord" },
    { id: "snapchat", label: "Snapchat" },
    { id: "settings", label: "Social Settings" },
  ],
  assets: [
    { id: "dna", label: "DNA DataBase" },
    { id: "staffing", label: "Staffing Files" },
    { id: "content", label: "Content" },
  ],
  production: [{ id: "stage-floor", label: "Production Stage Floor" }],
};

const CHANNEL_PAGE_BY_SEGMENT: Readonly<Record<string, ChannelPageId>> = {
  staffing: "staffing",
  marketing: "marketing",
  social: "social",
  assets: "assets",
  production: "production",
};

export function channelPageForPath(pathname: string): ChannelPageId | undefined {
  const match = pathname.match(/^\/app\/channels\/[^/]+(?:\/([^/]+))?\/?$/);
  if (!match) return undefined;
  return match[1] ? CHANNEL_PAGE_BY_SEGMENT[match[1]] : "dashboard";
}

export function resolveChannelView(page: ChannelPageId, requestedView: string | null | undefined) {
  const views = CHANNEL_VIEW_REGISTRY[page];
  if (!views.length) return undefined;
  return views.find(({ id }) => id === requestedView) ?? views[0];
}

export function channelViewHref(pathname: string, queryString: string, viewId: string) {
  const page = channelPageForPath(pathname);
  if (!page || resolveChannelView(page, viewId)?.id !== viewId) return null;
  const params = new URLSearchParams(queryString);
  params.set("view", viewId);
  return `${pathname}?${params.toString()}`;
}
