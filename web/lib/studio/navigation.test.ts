import { describe, expect, it } from "vitest";
import { STUDIO_MODULE, channelForPath, navGroupForPath, navItemIsActive, pathMatches } from "./navigation";

describe("product navigation", () => {
  it("has one Studio module", () => {
    expect(STUDIO_MODULE.label).toBe("Studio");
  });

  it("lists Collective, Integrations, Secrets, and Studio setup", () => {
    expect(STUDIO_MODULE.items.map(({ label }) => label)).toEqual([
      "Collective", "Integrations", "Secrets", "Studio setup",
    ]);
  });

  it("keeps account access out of the module", () => {
    const hrefs = STUDIO_MODULE.items.map(({ href }) => href);
    expect(hrefs.some((href) => href.startsWith("/account") || href.includes("billing"))).toBe(false);
  });

  it.each([
    ["/app", "Studio"],
    ["/app/channels/123", "Studio"],
    ["/app/collective", "Studio"],
    ["/app/secrets", "Studio"],
    ["/app/integrations", "Studio"],
    ["/app/onboarding", "Studio"],
    ["/app/marketing", "Studio"],
  ])("assigns %s to %s", (pathname, label) => {
    expect(navGroupForPath(pathname).label).toBe(label);
  });

  it("uses exact matching for app root", () => {
    expect(pathMatches("/app/channels", "/app")).toBe(false);
  });

  it("keeps setup reachable from its nav item", () => {
    const setup = STUDIO_MODULE.items[3];
    expect(navItemIsActive("/app/onboarding", setup)).toBe(true);
    expect(navItemIsActive("/app", setup)).toBe(false);
  });

  it("finds a channel by its full path segment without a fallback", () => {
    const channels = [{ id: "cinema" }, { id: "cinema-2" }];
    expect(channelForPath(channels, "/app/channels/cinema-2/marketing")?.id).toBe("cinema-2");
    expect(channelForPath(channels, "/account")).toBeUndefined();
  });
});
