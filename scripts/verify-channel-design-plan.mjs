import fs from "node:fs";
import path from "node:path";

const PLAN_PATH = path.resolve("planning/channel-submenu-design-plan.md");

if (!fs.existsSync(PLAN_PATH)) {
  console.error("FAIL: planning/channel-submenu-design-plan.md does not exist");
  process.exit(1);
}

const content = fs.readFileSync(PLAN_PATH, "utf8");

const REQUIRED_SECTIONS = [
  "# Gem Studio — Channel Submenu Comprehensive Design Plan",
  "## 1. Executive Summary & Design Foundations",
  "## 2. Global Navigation & Chrome Invariants",
  "## 3. Page 1: Channel Dashboard (`/app/channels/[channelId]`)",
  "## 4. Page 2: Channel Staffing (`/app/channels/[channelId]/staffing`)",
  "## 5. Page 3: Marketing & Budget (`/app/channels/[channelId]/marketing`)",
  "## 6. Page 4: Social Media & Signals (`/app/channels/[channelId]/social`)",
  "## 7. Page 5: Assets & DNA Continuity (`/app/channels/[channelId]/assets`)",
  "## 8. Page 6: Production Pipeline (`/app/channels/[channelId]/production`)",
  "## 9. Cross-Discipline Review & Verification (better-interface)",
  "## 10. Layout, Spatial Rhythms & Responsive Breakpoints (better-layout)",
  "## 11. Tastemaker Visual Craft & Anti-Slop Audit (tastemaker)",
  "## 12. State Matrix & Edge Cases",
  "## 13. Implementation Roadmap & Milestones",
];

const missingSections = REQUIRED_SECTIONS.filter((s) => !content.includes(s));
if (missingSections.length > 0) {
  console.error("FAIL: Missing required sections:\n" + missingSections.join("\n"));
  process.exit(1);
}

const REQUIRED_KEYWORDS = [
  "ChannelSubnav",
  "Studio Dark",
  "oklch",
  "WCAG",
  "Space Grotesk",
  "DM Mono",
  "Syne",
  "updateChannel",
  "setChannelStaffAction",
  "saveChannelMarketingBudget",
  "channels",
  "productions",
  "channel_staff",
  "channel_marketing_budgets",
  "social_connections",
  "signals",
  "production_dna",
  "dna_records",
  "generated_assets",
  "empty state",
  "loading state",
  "error state",
  "populated state",
  "12-column",
  "telemetry",
];

const missingKeywords = REQUIRED_KEYWORDS.filter((k) => !content.toLowerCase().includes(k.toLowerCase()));
if (missingKeywords.length > 0) {
  console.error("FAIL: Missing required keywords:\n" + missingKeywords.join("\n"));
  process.exit(1);
}

console.log("channel-submenu-design-plan verification passed");
