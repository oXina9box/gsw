import { describe, expect, it } from "vitest";
import { FRONT_OFFICE_MODULE, STUDIO_MODULE, navGroupForPath, navItemIsActive, pathMatches } from "./navigation";

describe("product navigation", () => {
  it("has two switchable modules, Studio first", () => {
    expect([STUDIO_MODULE.label, FRONT_OFFICE_MODULE.label]).toEqual(["Studio", "Front Office"]);
  });

  it("keeps implementation names out of primary navigation", () => {
    expect(STUDIO_MODULE.items.map(({ label }) => label)).toEqual([
      "Collective", "Studio Floor", "Assets", "Orchestration", "Integrations", "Secrets",
    ]);
    expect(FRONT_OFFICE_MODULE.items.map(({ label }) => label)).toEqual([
      "Overview", "Studio setup", "Channels", "Marketing", "Socials", "Staffing",
    ]);
  });

  it("keeps account access out of both modules", () => {
    const hrefs = [...STUDIO_MODULE.items, ...FRONT_OFFICE_MODULE.items].map(({ href }) => href);
    expect(hrefs.some((href) => href.startsWith("/account") || href.includes("billing"))).toBe(false);
  });

  it.each([
    ["/app/channels/123", "Front Office"],
    ["/app/marketing", "Front Office"],
    ["/app/agents", "Front Office"],
    ["/app/onboarding", "Front Office"],
    ["/app/collective", "Studio"],
    ["/app/secrets", "Studio"],
    ["/app/front-office", "Studio"],
    ["/app/productions/123", "Studio"],
    ["/app/dna", "Studio"],
    ["/app/genplay", "Studio"],
    ["/app/integrations", "Studio"],
  ])("assigns %s to %s", (pathname, label) => {
    expect(navGroupForPath(pathname).label).toBe(label);
  });

  it("uses exact matching for app root", () => {
    expect(pathMatches("/app/channels", "/app")).toBe(false);
    expect(navGroupForPath("/unknown").label).toBe("Front Office");
  });

  it("keeps legacy routes active under their task label", () => {
    const staffing = FRONT_OFFICE_MODULE.items[5];
    const assets = STUDIO_MODULE.items[2];
    expect(navItemIsActive("/app/builder", staffing)).toBe(true);
    expect(navItemIsActive("/app/genplay", assets)).toBe(true);
    expect(navItemIsActive("/app/social", staffing)).toBe(false);
  });
});
