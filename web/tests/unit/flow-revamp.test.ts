import { describe, expect, it } from "vitest";
import {
  PRO_PLANS,
  BYOK_PLANS,
  SELF_HOST_EDITION,
  ALL_PRICING_PLANS,
  PAYROLL_BUDGET_CATEGORIES,
} from "@/lib/studio/pricing";
import {
  CORE_DEPARTMENTS_CONFIG,
  PRECONFIGURED_LANES,
  getPreconfiguredLanesForDepartment,
  isProUserPlan,
} from "@/lib/studio/departments";
import {
  AGENT_SIX_FILES,
  PROTECTED_IP_MESSAGE,
  sanitizeAgentFiles,
  canEditAgentFiles,
  validateCustomAgentFiles,
} from "@/lib/studio/agent-protection";
import {
  validateStudioIdentity,
  validateCommercialChoice,
  validateLogoUpload,
  LOGO_MAX_BYTES,
} from "@/lib/studio/onboarding";

describe("Flow Revamp: Pricing & Editions", () => {
  it("defines all Pro tiers with channels, credits, and all agents included", () => {
    expect(PRO_PLANS).toHaveLength(3);
    const [contentPro, creatorPro, hollywoodPro] = PRO_PLANS;

    expect(contentPro.name).toBe("Content Pro");
    expect(contentPro.channels).toBe("1 Channel");
    expect(contentPro.agentsIncluded).toBe(true);
    expect(contentPro.byokCapable).toBe(true);

    expect(creatorPro.name).toBe("Creator Pro");
    expect(creatorPro.channels).toBe("3 Channels");
    expect(creatorPro.featured).toBe(true);
    expect(creatorPro.agentsIncluded).toBe(true);

    expect(hollywoodPro.name).toBe("Hollywood Pro");
    expect(hollywoodPro.channels).toBe("5 Channels");
    expect(hollywoodPro.agentsIncluded).toBe(true);
  });

  it("defines BYOK subscriptions with zero platform credit markup and payroll options", () => {
    expect(BYOK_PLANS).toHaveLength(2);
    const [contentByok, creatorByok] = BYOK_PLANS;

    expect(contentByok.name).toBe("Content BYOK");
    expect(contentByok.channels).toBe("1 Channel");
    expect(contentByok.credits).toContain("0 markup");

    expect(creatorByok.name).toBe("Creator BYOK");
    expect(creatorByok.channels).toBe("3 Channels");
    expect(creatorByok.credits).toContain("0 markup");

    expect(ALL_PRICING_PLANS).toHaveLength(6);
  });

  it("defines Self Host Creator Community edition with BYOK and custom channels", () => {
    expect(SELF_HOST_EDITION.name).toBe("Self Host Creator Community");
    expect(SELF_HOST_EDITION.category).toBe("self-host");
    expect(SELF_HOST_EDITION.byokCapable).toBe(true);
    expect(SELF_HOST_EDITION.features).toContain("Run on your own hardware or VPS");
  });

  it("defines Payroll Budget categories for creative, production, operations, and agents", () => {
    expect(PAYROLL_BUDGET_CATEGORIES).toHaveLength(4);
    const titles = PAYROLL_BUDGET_CATEGORIES.map((c) => c.title);
    expect(titles).toContain("Creative");
    expect(titles).toContain("Production");
    expect(titles).toContain("Operations");
    expect(titles).toContain("Agent Payroll");
  });
});

describe("Flow Revamp: 4 Core Departments & Lanes", () => {
  it("defines 4 core departments: Marketing, Socials, Development, Production", () => {
    expect(CORE_DEPARTMENTS_CONFIG).toHaveLength(4);
    const names = CORE_DEPARTMENTS_CONFIG.map((d) => d.name);
    expect(names).toEqual(["Marketing", "Socials", "Development", "Production"]);
  });

  it("defines preconfigured lanes for each department", () => {
    expect(PRECONFIGURED_LANES.length).toBeGreaterThanOrEqual(12);

    const mktLanes = getPreconfiguredLanesForDepartment("Marketing");
    expect(mktLanes.length).toBeGreaterThan(0);
    expect(mktLanes.some((l) => l.name.includes("Brand"))).toBe(true);

    const socLanes = getPreconfiguredLanesForDepartment("Socials");
    expect(socLanes.length).toBeGreaterThan(0);
    expect(socLanes.some((l) => l.name.includes("Clip"))).toBe(true);

    const devLanes = getPreconfiguredLanesForDepartment("Development");
    expect(devLanes.length).toBeGreaterThan(0);
    expect(devLanes.some((l) => l.name.includes("Screenplay") || l.name.includes("DNA"))).toBe(true);

    const prodLanes = getPreconfiguredLanesForDepartment("Production");
    expect(prodLanes.length).toBeGreaterThan(0);
    expect(prodLanes.some((l) => l.name.includes("GenPlay"))).toBe(true);
  });

  it("resolves Pro vs BYOK plan correctly", () => {
    expect(isProUserPlan("content-pro")).toBe(true);
    expect(isProUserPlan("creator-pro")).toBe(true);
    expect(isProUserPlan("hollywood-pro")).toBe(true);
    expect(isProUserPlan("content-byok")).toBe(false);
    expect(isProUserPlan("creator-byok")).toBe(false);
  });
});

describe("Flow Revamp: 6-File Agent Contract & IP Protection Boundary", () => {
  it("enforces the standard 6-file contract keys", () => {
    expect(AGENT_SIX_FILES).toEqual([
      "role",
      "soul",
      "jobdescription",
      "skills",
      "memory",
      "user_content",
    ]);
  });

  it("shields protected catalog agent files so IP is never tipped to the browser", () => {
    const rawFiles = {
      agent_id: "agent-123",
      role: "SECRET SYSTEM PROMPT: You are a protected Hollywood Director",
      soul: "SECRET AESTHETIC DIRECTIVE",
      jobdescription: "SECRET TASK CONTRACT",
      skills: "SECRET CAPABILITIES",
      memory: "SECRET CANON REFERENCE",
      user_content: "SECRET USER PROMPT",
    };

    // Protected agent files MUST be sanitized
    const sanitized = sanitizeAgentFiles(true, rawFiles);
    expect(sanitized.role).toBe(PROTECTED_IP_MESSAGE);
    expect(sanitized.soul).toBe(PROTECTED_IP_MESSAGE);
    expect(sanitized.jobdescription).toBe(PROTECTED_IP_MESSAGE);
    expect(sanitized.skills).toBe(PROTECTED_IP_MESSAGE);
    expect(sanitized.memory).toBe(PROTECTED_IP_MESSAGE);
    expect(sanitized.user_content).toBe(PROTECTED_IP_MESSAGE);

    // Editing protected agents is prohibited
    expect(canEditAgentFiles({ protected_config: true })).toBe(false);
  });

  it("allows custom unprotected agents to be fully viewed and edited across all 6 files", () => {
    const customFiles = {
      agent_id: "custom-agent-456",
      role: "Custom Continuity Supervisor",
      soul: "Meticulous and detail-oriented",
      jobdescription: "Verify scene color palettes and wardrobe",
      skills: "Color grading, costume continuity",
      memory: "Episode 1-3 approved character wardrobe",
      user_content: "Focus on cyberpunk lighting cues",
    };

    const sanitized = sanitizeAgentFiles(false, customFiles);
    expect(sanitized.role).toBe(customFiles.role);
    expect(sanitized.soul).toBe(customFiles.soul);
    expect(sanitized.jobdescription).toBe(customFiles.jobdescription);
    expect(canEditAgentFiles({ protected_config: false })).toBe(true);

    const validation = validateCustomAgentFiles(customFiles);
    expect(validation.valid).toBe(true);
    expect(validation.data?.role).toBe(customFiles.role);
  });
});

describe("Flow Revamp: Studio Essentials & Onboarding Validation", () => {
  it("validates studio identity with name, brand colors palette, and tagline", () => {
    const input = {
      studioNameStatus: "provided",
      studioName: "Cyberpunk Cinema Studio",
      brandColors: ["#ff0055", "#00ffff", "#111122"],
      tagline: "Cinema at the speed of light",
      contentDirectionStatus: "provided",
      contentDirection: "Film",
      contentDescription: "High-octane sci-fi narrative short films",
    };

    const result = validateStudioIdentity(input);
    expect(result.valid).toBe(true);
    expect(result.data?.studioName).toBe("Cyberpunk Cinema Studio");
    expect(result.data?.tagline).toBe("Cinema at the speed of light");
    expect(result.data?.brandColors).toHaveLength(3);
  });

  it("handles deferred studio name and default brand accent", () => {
    const input = {
      studioNameStatus: "deferred",
      brandColors: [],
      contentDirectionStatus: "deferred",
    };

    const result = validateStudioIdentity(input);
    expect(result.valid).toBe(true);
    expect(result.data?.studioName).toBe("Untitled Studio");
    expect(result.data?.brandColors).toEqual(["#ea0070"]);
    expect(result.data?.contentDirection).toBe("Decide later");
  });

  it("validates logo uploads according to size and mime constraints", () => {
    expect(validateLogoUpload({ type: "image/png", size: 1024 * 1024 }).valid).toBe(true);
    expect(validateLogoUpload({ type: "image/svg+xml", size: 500 * 1024 }).valid).toBe(true);
    expect(validateLogoUpload({ type: "image/webp", size: 2 * 1024 * 1024 }).valid).toBe(true);
    expect(validateLogoUpload({ type: "image/jpeg", size: 1024 }).valid).toBe(false);
    expect(validateLogoUpload({ type: "image/png", size: LOGO_MAX_BYTES + 1 }).valid).toBe(false);
  });

  it("validates commercial choice across all tiers", () => {
    expect(validateCommercialChoice({ plan: "content-pro", byokEnabled: false }).valid).toBe(true);
    expect(validateCommercialChoice({ plan: "creator-pro", byokEnabled: true }).valid).toBe(true);
    expect(validateCommercialChoice({ plan: "hollywood-pro", byokEnabled: false }).valid).toBe(true);
    expect(validateCommercialChoice({ plan: "content-byok", byokEnabled: true }).valid).toBe(true);
    expect(validateCommercialChoice({ plan: "creator-byok", byokEnabled: true }).valid).toBe(true);
    expect(validateCommercialChoice({ plan: "self-host", byokEnabled: true }).valid).toBe(true);
  });
});
