import { describe, expect, it } from "vitest";
import {
  COMMERCIAL_PLANS,
  CONTENT_DIRECTION_OPTIONS,
  LOGO_ALLOWED_MIME_TYPES,
  LOGO_MAX_BYTES,
  LOGO_MAX_DIMENSION,
  furthestOnboardingStep,
  maskApiKey,
  nextOnboardingStep,
  shouldRedirectToOnboarding,
  validateCommercialChoice,
  validateLogoUpload,
  validateStudioIdentity,
} from "./onboarding";

describe("onboarding transitions", () => {
  it("requires ordered steps and permits retry", () => {
    expect(nextOnboardingStep(null, "identity")).toBe("identity");
    expect(nextOnboardingStep(null, "channel")).toBeNull();
    expect(nextOnboardingStep("identity", "identity")).toBe("identity");
    expect(nextOnboardingStep("identity", "commercial")).toBe("commercial");
    expect(nextOnboardingStep("identity", "complete")).toBeNull();
  });

  it("permits navigating backward to earlier completed steps", () => {
    expect(nextOnboardingStep("providers", "identity")).toBe("identity");
    expect(nextOnboardingStep("providers", "commercial")).toBe("commercial");
    expect(nextOnboardingStep("hiring", "channel")).toBe("channel");
  });

  it("never regresses saved progress", () => {
    expect(furthestOnboardingStep("complete", "commercial")).toBe("complete");
    expect(furthestOnboardingStep("identity", "commercial")).toBe("commercial");
    expect(furthestOnboardingStep(null, "identity")).toBe("identity");
  });
});

describe("onboarding progress", () => {
  it("reports completion for legacy callers", () => {
    expect(shouldRedirectToOnboarding("complete")).toBe(false);
    expect(shouldRedirectToOnboarding("identity")).toBe(true);
    expect(shouldRedirectToOnboarding("commercial")).toBe(true);
    expect(shouldRedirectToOnboarding(null)).toBe(true);
  });
});

describe("studio identity validation", () => {
  it("accepts valid provided studio identity", () => {
    const res = validateStudioIdentity({
      studioNameStatus: "provided",
      studioName: "Cyberpunk Cinema",
      brandColors: ["#EA0070", "#7000EA", "#09090B"],
      contentDirectionStatus: "provided",
      contentDirection: "Episodic series",
      contentDescription: "A neon noir series in 2088.",
    });
    expect(res.valid).toBe(true);
    expect(res.data?.studioName).toBe("Cyberpunk Cinema");
    expect(res.data?.brandColors).toEqual(["#ea0070", "#7000ea", "#09090b"]);
    expect(res.data?.contentDirection).toBe("Episodic series");
  });
  it("supports all declared content direction options", () => {
    for (const opt of CONTENT_DIRECTION_OPTIONS) {
      const res = validateStudioIdentity({
        studioNameStatus: "provided",
        studioName: "Studio X",
        contentDirectionStatus: "provided",
        contentDirection: opt,
      });
      expect(res.valid).toBe(true);
      expect(res.data?.contentDirection).toBe(opt);
    }
  });

  it("handles deferred studio name gracefully", () => {
    const res = validateStudioIdentity({
      studioNameStatus: "deferred",
      brandColors: [],
      contentDirectionStatus: "deferred",
    });
    expect(res.valid).toBe(true);
    expect(res.data?.studioNameStatus).toBe("deferred");
    expect(res.data?.studioName).toBe("Untitled Studio");
    expect(res.data?.brandColors).toEqual(["#ea0070"]);
    expect(res.data?.contentDirection).toBe("Decide later");
  });

  it("rejects empty studio name when provided", () => {
    const res = validateStudioIdentity({
      studioNameStatus: "provided",
      studioName: "   ",
    });
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Studio name is required when provided");
  });

  it("caps brand colors at 3 and validates hex format", () => {
    const res = validateStudioIdentity({
      studioNameStatus: "provided",
      studioName: "Studio A",
      brandColors: ["#111111", "#222222", "#333333", "#444444", "invalid-color"],
    });
    expect(res.valid).toBe(true);
    expect(res.data?.brandColors).toHaveLength(3);
    expect(res.data?.brandColors).toEqual(["#111111", "#222222", "#333333"]);
  });
});

describe("commercial choice validation", () => {
  it("validates valid plans", () => {
    for (const plan of COMMERCIAL_PLANS) {
      const res = validateCommercialChoice({ plan, byokEnabled: false });
      expect(res.valid).toBe(true);
      expect(res.data?.plan).toBe(plan);
    }
  });

  it("defaults byokEnabled to true for byok plan", () => {
    const res = validateCommercialChoice({ plan: "byok" });
    expect(res.valid).toBe(true);
    expect(res.data?.byokEnabled).toBe(true);
  });

  it("rejects invalid plan", () => {
    const res = validateCommercialChoice({ plan: "unlimited-free" });
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Invalid commercial plan selected");
  });
});

describe("logo upload validation", () => {
  it("accepts valid SVG/PNG/WebP under 5 MB", () => {
    for (const type of LOGO_ALLOWED_MIME_TYPES) {
      const res = validateLogoUpload({ type, size: 2 * 1024 * 1024, width: 1024, height: 1024 });
      expect(res.valid).toBe(true);
    }
  });

  it("rejects unsupported MIME type", () => {
    const res = validateLogoUpload({ type: "image/gif", size: 1024 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Unsupported image format");
  });

  it("rejects file over 5 MB", () => {
    const res = validateLogoUpload({ type: "image/png", size: LOGO_MAX_BYTES + 1 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("File exceeds max upload size");
  });

  it("rejects dimension over 4096px", () => {
    const res = validateLogoUpload({ type: "image/png", size: 1024, width: LOGO_MAX_DIMENSION + 1 });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Image width exceeds max dimension");
  });
});

describe("api key masking", () => {
  it("masks openai and anthropic keys truthfully", () => {
    expect(maskApiKey("sk-proj-1234567890abcdef1234567890")).toBe("sk-proj...7890");
    expect(maskApiKey("sk-ant-api03-abcdefghijklmnop1234")).toBe("sk-ant-...1234");
    expect(maskApiKey("short")).toBe("••••••••");
    expect(maskApiKey("")).toBe("");
  });
});
