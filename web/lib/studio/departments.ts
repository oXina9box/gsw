export type DepartmentName = "Marketing" | "Socials" | "Development" | "Production";

export interface PreconfiguredLane {
  id: string;
  name: string;
  department: DepartmentName;
  description: string;
  defaultCollaborationMode: "forward" | "round_table";
  recommendedCycles?: number;
  capabilities: string[];
}

export interface DepartmentMeta {
  name: DepartmentName;
  slug: string;
  description: string;
  displayOrder: number;
}

export const CORE_DEPARTMENTS_CONFIG: DepartmentMeta[] = [
  {
    name: "Marketing",
    slug: "marketing",
    description: "Brand direction, campaign planning, audience discovery, and studio messaging.",
    displayOrder: 1,
  },
  {
    name: "Socials",
    slug: "socials",
    description: "Platform-native short-form cuts, community interaction, and release dispatch.",
    displayOrder: 2,
  },
  {
    name: "Development",
    slug: "development",
    description: "Screenplay authoring, storyboards, character DNA continuity, and worldbuilding.",
    displayOrder: 3,
  },
  {
    name: "Production",
    slug: "production",
    description: "GenPlay shot generation, scene assembly, color/sound mastering, and rendering.",
    displayOrder: 4,
  },
];

export const PRECONFIGURED_LANES: PreconfiguredLane[] = [
  // Marketing Lanes
  {
    id: "mkt-brand",
    name: "Brand Direction & Positioning",
    department: "Marketing",
    description: "Establish tone of voice, visual identity constraints, and market positioning.",
    defaultCollaborationMode: "forward",
    capabilities: ["text", "strategy"],
  },
  {
    id: "mkt-campaign",
    name: "Campaign Strategy & Launch",
    department: "Marketing",
    description: "Multi-channel release blueprints, promotional cadence, and asset schedules.",
    defaultCollaborationMode: "forward",
    capabilities: ["text", "planning"],
  },
  {
    id: "mkt-audience",
    name: "Audience Discovery & Insights",
    department: "Marketing",
    description: "Demographic profiling, taste clustering, and viewer feedback synthesis.",
    defaultCollaborationMode: "round_table",
    recommendedCycles: 2,
    capabilities: ["text", "research"],
  },

  // Socials Lanes
  {
    id: "soc-clips",
    name: "Short-Form Clip Factory",
    department: "Socials",
    description: "Generate vertical aspect cuts (9:16), micro-hooks, and teaser trailers.",
    defaultCollaborationMode: "forward",
    capabilities: ["video", "text"],
  },
  {
    id: "soc-community",
    name: "Community Voice & Pulse",
    department: "Socials",
    description: "Draft engagement posts, replies, viewer polls, and sentiment trackers.",
    defaultCollaborationMode: "round_table",
    recommendedCycles: 2,
    capabilities: ["text"],
  },
  {
    id: "soc-dispatch",
    name: "Platform Release Dispatcher",
    department: "Socials",
    description: "Format, schedule, and stage content across YouTube, TikTok, X, and Instagram.",
    defaultCollaborationMode: "forward",
    capabilities: ["text", "distribution"],
  },

  // Development Lanes
  {
    id: "dev-script",
    name: "Screenplay & Dialogue Lab",
    department: "Development",
    description: "Scene-by-scene scriptwriting, dialogue polish, and pacing structure.",
    defaultCollaborationMode: "round_table",
    recommendedCycles: 3,
    capabilities: ["text", "script"],
  },
  {
    id: "dev-storyboard",
    name: "Storyboards & Visual Flow",
    department: "Development",
    description: "Visual shot sequencing, camera movement keys, and framing sketches.",
    defaultCollaborationMode: "forward",
    capabilities: ["image", "text"],
  },
  {
    id: "dev-dna",
    name: "DNA Continuity & Canon",
    department: "Development",
    description: "Lock character traits, wardrobe canon, lighting rules, and location palettes.",
    defaultCollaborationMode: "forward",
    capabilities: ["text", "continuity"],
  },

  // Production Lanes
  {
    id: "prod-genplay",
    name: "GenPlay Virtual Stage",
    department: "Production",
    description: "Execute reproducible shot contracts with AI image & video engines.",
    defaultCollaborationMode: "forward",
    capabilities: ["image", "video"],
  },
  {
    id: "prod-assembly",
    name: "Scene Assembly & Edit",
    department: "Production",
    description: "Sequence generated masters, align audio stems, and enforce continuity gates.",
    defaultCollaborationMode: "forward",
    capabilities: ["video", "assembly"],
  },
  {
    id: "prod-master",
    name: "Master Color & Audio",
    department: "Production",
    description: "Final color grading pass, dynamic audio mix, and multi-format delivery export.",
    defaultCollaborationMode: "forward",
    capabilities: ["audio", "video"],
  },
];

export function getPreconfiguredLanesForDepartment(departmentName: DepartmentName): PreconfiguredLane[] {
  return PRECONFIGURED_LANES.filter((lane) => lane.department === departmentName);
}

export function isProUserPlan(planId: string | null | undefined): boolean {
  if (!planId) return true; // Default to Pro experience
  const clean = planId.toLowerCase();
  return clean.includes("pro") || clean.includes("cloud") || clean === "hollywood";
}
