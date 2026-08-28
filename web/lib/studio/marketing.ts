export const MARKETING_AGENT_ROLES = [
  {
    slug: "marketing-director",
    name: "Marketing Director",
    department: "Marketing",
    summary: "Oversee studio brand strategy, channel portfolio, and campaign orchestration.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
  {
    slug: "studio-brand-designer",
    name: "Studio Brand Designer",
    department: "Marketing",
    summary: "Define and maintain studio identity, visual guidelines, and brand marks.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
  {
    slug: "channel-discovery",
    name: "Channel Discovery",
    department: "Marketing",
    summary: "Analyze audience signals and define channel thesis and market opportunities.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
  {
    slug: "channel-branding",
    name: "Channel Branding",
    department: "Marketing",
    summary: "Design visual theming, typography, color palettes, and channel assets.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
  {
    slug: "channel-content-designer",
    name: "Channel Content Designer",
    department: "Marketing",
    summary: "Structure content taxonomy, episode frameworks, and format specifications.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
  {
    slug: "media-agent",
    name: "Media Planner",
    department: "Marketing",
    summary: "Plan distribution cadence, platform positioning, and cross-channel release schedule.",
    files: ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const,
  },
] as const;

export const AGENT_FILE_NAMES = ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const;
export type AgentFileName = (typeof AGENT_FILE_NAMES)[number];

export interface MarketingChecklistItem {
  id: string;
  label: string;
  category: "brand" | "channel" | "media";
  status: "complete" | "missing" | "deferred";
  description: string;
}

export function evaluateMarketingChecklist(profile: {
  studio_identity?: Record<string, unknown> | null;
  channel_setup?: Record<string, unknown> | null;
  lane_handoffs?: Record<string, unknown> | null;
}): MarketingChecklistItem[] {
  const identity = profile.studio_identity ?? {};
  const channel = profile.channel_setup ?? {};
  const handoffs = profile.lane_handoffs ?? {};

  const items: MarketingChecklistItem[] = [
    {
      id: "studio_name",
      label: "Studio Name",
      category: "brand",
      status: identity.studio_name_status === "deferred" ? "deferred" : identity.studio_name ? "complete" : "missing",
      description: typeof identity.studio_name === "string" && identity.studio_name ? identity.studio_name : "Untitled Studio",
    },
    {
      id: "brand_colors",
      label: "Brand Colors",
      category: "brand",
      status: Array.isArray(identity.brand_colors) && identity.brand_colors.length > 0 ? "complete" : "missing",
      description: Array.isArray(identity.brand_colors) ? identity.brand_colors.join(", ") : "#ea0070",
    },
    {
      id: "channel_name",
      label: "First Channel",
      category: "channel",
      status: channel.channel_name ? "complete" : "missing",
      description: typeof channel.channel_name === "string" && channel.channel_name ? channel.channel_name : "No channel filed",
    },
    {
      id: "content_direction",
      label: "Content Taxonomy",
      category: "channel",
      status: identity.content_direction_status === "deferred" ? "deferred" : identity.content_direction ? "complete" : "missing",
      description: typeof identity.content_direction === "string" ? identity.content_direction : "Decide later",
    },
    {
      id: "brand_approval",
      label: "Brand Brief Approved",
      category: "brand",
      status: handoffs.studio_brand_approved ? "complete" : "missing",
      description: handoffs.studio_brand_approved ? "Approved by owner" : "Pending review",
    },
    {
      id: "channel_approval",
      label: "Channel Brief Approved",
      category: "channel",
      status: handoffs.channel_discovery_approved ? "complete" : "missing",
      description: handoffs.channel_discovery_approved ? "Approved by owner" : "Pending review",
    },
    {
      id: "media_approval",
      label: "Media Plan Approved",
      category: "media",
      status: handoffs.media_plan_approved ? "complete" : "missing",
      description: handoffs.media_plan_approved ? "Approved by owner" : "Pending review",
    },
  ];

  return items;
}

export function validateMarketingHandoff(handoffs: Record<string, unknown>): { valid: boolean; error?: string } {
  if (!handoffs.studio_brand_approved) return { valid: false, error: "Studio brand brief must be approved" };
  if (!handoffs.channel_discovery_approved) return { valid: false, error: "Channel discovery brief must be approved" };
  if (!handoffs.media_plan_approved) return { valid: false, error: "Media schedule plan must be approved" };
  return { valid: true };
}
