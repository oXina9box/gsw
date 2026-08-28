export interface PlanDetail {
  id: string;
  name: string;
  category: "pro" | "byok" | "self-host";
  badge?: string;
  channels: string;
  credits: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  byokCapable: boolean;
  agentsIncluded: boolean;
}

export const PRO_PLANS: PlanDetail[] = [
  {
    id: "content-pro",
    name: "Content Pro",
    category: "pro",
    channels: "1 Channel",
    credits: "Low credits included",
    price: "$29",
    period: "/ month",
    description: "A focused production space for one recurring publishing outlet.",
    features: [
      "1 Publishing channel",
      "Low monthly generation credits",
      "All official agents included",
      "Can pair optional BYOK keys",
      "Studio continuity & DNA records",
    ],
    cta: "Start with Content Pro",
    byokCapable: true,
    agentsIncluded: true,
  },
  {
    id: "creator-pro",
    name: "Creator Pro",
    category: "pro",
    badge: "Most Popular",
    channels: "3 Channels",
    credits: "Mid credits included",
    price: "$79",
    period: "/ month",
    description: "Multi-channel capacity for active series, shows, and formats.",
    features: [
      "3 Publishing channels",
      "Mid monthly generation credits",
      "All official agents included",
      "Hybrid Cloud + BYOK provider routing",
      "Shared asset warehouse & priority lanes",
    ],
    cta: "Start with Creator Pro",
    featured: true,
    byokCapable: true,
    agentsIncluded: true,
  },
  {
    id: "hollywood-pro",
    name: "Hollywood Pro",
    category: "pro",
    channels: "5 Channels",
    credits: "Max credits included",
    price: "$199",
    period: "/ month",
    description: "The complete commercial operating floor for working studio slates.",
    features: [
      "5 Publishing channels (expandable)",
      "Max monthly generation credits",
      "All official agents included",
      "Custom BYOK key pairing & model tiers",
      "Full 13-stage pipeline & multi-seat floor",
    ],
    cta: "Start with Hollywood Pro",
    byokCapable: true,
    agentsIncluded: true,
  },
];

export const BYOK_PLANS: PlanDetail[] = [
  {
    id: "content-byok",
    name: "Content BYOK",
    category: "byok",
    channels: "1 Channel",
    credits: "No credits (0 markup)",
    price: "$15",
    period: "/ month",
    description: "Lowest cost software entry. Bring direct OpenAI & Anthropic keys.",
    features: [
      "1 Publishing channel",
      "0 Platform credit markup",
      "Direct provider billing & limits",
      "Payroll Budget options for agents",
      "Custom agent builder (6 files)",
    ],
    cta: "Start Content BYOK",
    byokCapable: true,
    agentsIncluded: false,
  },
  {
    id: "creator-byok",
    name: "Creator BYOK",
    category: "byok",
    channels: "3 Channels",
    credits: "No credits (0 markup)",
    price: "$39",
    period: "/ month",
    description: "Second lowest cost for multi-channel creators on direct API accounts.",
    features: [
      "3 Publishing channels",
      "0 Platform credit markup",
      "Direct provider billing & limits",
      "Payroll Budget options for agents",
      "Custom agent builder (6 files)",
    ],
    cta: "Start Creator BYOK",
    byokCapable: true,
    agentsIncluded: false,
  },
];

export const SELF_HOST_EDITION: PlanDetail = {
  id: "self-host-community",
  name: "Self Host Creator Community",
  category: "self-host",
  channels: "Custom # of Channels",
  credits: "100% BYOK",
  price: "Free & Open Core",
  description: "Run Gem Studio on your own hardware or private VPS with harder limits.",
  features: [
    "Run on your own hardware or VPS",
    "Bring your own OpenAI & Anthropic keys",
    "Customizable channel limits",
    "Harder system limits based on host resources",
    "Set core agents unless you build custom ones",
    "Full 6-file agent authoring contract",
  ],
  cta: "Download on GitHub ↗",
  byokCapable: true,
  agentsIncluded: false,
};

export const ALL_PRICING_PLANS = [...PRO_PLANS, ...BYOK_PLANS, SELF_HOST_EDITION];

export const PAYROLL_BUDGET_CATEGORIES = [
  {
    id: "01",
    title: "Creative",
    description: "Writers, concept artists, and story architects.",
  },
  {
    id: "02",
    title: "Production",
    description: "Editors, GenPlay supervisors, and sound designers.",
  },
  {
    id: "03",
    title: "Operations",
    description: "Channel managers, community leads, and distribution.",
  },
  {
    id: "04",
    title: "Agent Payroll",
    description: "Estimated monthly API execution reserves per department.",
  },
];
