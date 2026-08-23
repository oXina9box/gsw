import { describe, expect, it } from "vitest";
import { NAV_GROUPS, navGroupForPath, navItemIsActive, pathMatches } from "./navigation";

describe("product navigation", () => {
  it("has three master modules", () => {
    expect(NAV_GROUPS.map(({ label }) => label)).toEqual(["Front Office", "Studio", "Account"]);
  });

  it("keeps implementation names out of primary navigation", () => {
    const labels = NAV_GROUPS.flatMap(({ items }) => items.map(({ label }) => label));
    expect(labels).toEqual([
      "Overview", "Channels", "Marketing", "Socials", "Staffing",
      "Overview", "Assets", "Orchestration",
      "Profile & Settings", "Integrations", "Billing",
    ]);
  });

  it.each([
    ["/app/channels/123", "Front Office"],
    ["/app/marketing", "Front Office"],
    ["/app/agents", "Front Office"],
    ["/app/front-office", "Studio"],
    ["/app/productions/123", "Studio"],
    ["/app/dna", "Studio"],
    ["/app/genplay", "Studio"],
    ["/app/billing", "Account"],
  ])("assigns %s to %s", (pathname, label) => {
    expect(navGroupForPath(pathname).label).toBe(label);
  });

  it("uses exact matching for app root", () => {
    expect(pathMatches("/app/channels", "/app")).toBe(false);
    expect(navGroupForPath("/unknown").label).toBe("Front Office");
  });

  it("keeps legacy routes active under their task label", () => {
    const staffing = NAV_GROUPS[0].items[4];
    const assets = NAV_GROUPS[1].items[1];
    expect(navItemIsActive("/app/builder", staffing)).toBe(true);
    expect(navItemIsActive("/app/genplay", assets)).toBe(true);
    expect(navItemIsActive("/app/social", staffing)).toBe(false);
  });
});
