import { describe, expect, it } from "vitest";
import {
  DEPARTMENTS,
  DNA_GROUPS,
  DNA_TIERS,
  JOB_KINDS,
  MAX_CLIP_BYTES,
  MODEL_TIERS,
  creditBalance,
  isAssemblyClip,
  isDnaGroup,
  isDnaTier,
  isJobKind,
  isModelTier,
  normalizeRunMode,
  normalizeProviderBaseUrl,
  safeInternalPath,
  validateAssemblyTrim,
  validateCreditAmount,
} from "./domain";
describe("studio domain", () => {
  it("keeps the canonical production order", () => {
    expect(DEPARTMENTS).toHaveLength(13);
    expect(DEPARTMENTS[0]).toBe("Research");
    expect(DEPARTMENTS.at(-1)).toBe("Reporting");
  });

  it("normalizes unknown run modes to manual", () => {
    expect(normalizeRunMode("semi_auto")).toBe("semi_auto");
    expect(normalizeRunMode("anything")).toBe("manual");
  });

  it("allows local redirects and rejects protocol-relative redirects", () => {
    expect(safeInternalPath("/app/productions/123", "/app")).toBe("/app/productions/123");
    expect(safeInternalPath("//evil.example", "/app")).toBe("/app");
    expect(safeInternalPath("https://evil.example", "/app")).toBe("/app");
  });

  it("uses integer credits and rejects non-positive values", () => {
    expect(validateCreditAmount(25)).toBe(25);
    expect(() => validateCreditAmount(0)).toThrow("positive integer");
    expect(() => validateCreditAmount(1.5)).toThrow("positive integer");
    expect(creditBalance([{ amount: 100 }, { amount: -30 }, { amount: -20 }])).toBe(50);
  });

  it("accepts only executable job kinds", () => {
    expect(JOB_KINDS).toContain("assemble_master");
    expect(isJobKind("generate_text")).toBe(true);
    expect(isJobKind("drop database")).toBe(false);
  });

  it("accepts only bounded MP4 assembly clips", () => {
    expect(isAssemblyClip("video/mp4", MAX_CLIP_BYTES)).toBe(true);
    expect(isAssemblyClip("video/webm", 1024)).toBe(false);
    expect(isAssemblyClip("video/mp4", MAX_CLIP_BYTES + 1)).toBe(false);
  });

  it("accepts public HTTPS provider URLs and blocks private targets", () => {
    expect(normalizeProviderBaseUrl("https://api.example.com/v1/", false, ["api.example.com"])).toBe("https://api.example.com/v1");
    expect(() => normalizeProviderBaseUrl("https://api.example.com/v1", false)).toThrow("allowlisted");
    expect(() => normalizeProviderBaseUrl("http://127.0.0.1:8000/v1", false, ["127.0.0.1"])).toThrow("public HTTPS");
    expect(() => normalizeProviderBaseUrl("https://[fc00::1]/v1", false, ["[fc00::1]"])).toThrow("public HTTPS");
  });

  it("validates DNA tiers and groups", () => {
    expect(DNA_TIERS).toEqual(["A", "B"]);
    expect(isDnaTier("A")).toBe(true);
    expect(isDnaTier("B")).toBe(true);
    expect(isDnaTier("C")).toBe(false);
    expect(DNA_GROUPS).toContain("Universe");
    expect(DNA_GROUPS).toContain("Channel");
    expect(isDnaGroup("Universe")).toBe(true);
    expect(isDnaGroup("InvalidGroup")).toBe(false);
  });

  it("validates model tiers", () => {
    expect(MODEL_TIERS).toEqual(["free", "mid", "best"]);
    expect(isModelTier("free")).toBe(true);
    expect(isModelTier("mid")).toBe(true);
    expect(isModelTier("best")).toBe(true);
    expect(isModelTier("ultra")).toBe(false);
  });

  it("validates assembly trims", () => {
    expect(validateAssemblyTrim(100, 500, 1000)).toEqual({ startMs: 100, endMs: 500 });
    expect(validateAssemblyTrim(0, null)).toEqual({ startMs: 0, endMs: null });
    expect(() => validateAssemblyTrim(-1, 500)).toThrow("invalid_trim_start");
    expect(() => validateAssemblyTrim(500, 100)).toThrow("invalid_trim_end");
    expect(() => validateAssemblyTrim(0, 1500, 1000)).toThrow("trim_exceeds_duration");
  });
});
