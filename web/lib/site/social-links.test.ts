import { afterEach, describe, expect, it, vi } from "vitest";
import { configured, socialLinks } from "./social-links";

describe("social links", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("keeps the nine requested labels and disables unknown destinations", () => {
    expect(socialLinks.map((link) => link.label)).toEqual([
      "TikTok", "YouTube", "Instagram", "X", "Telegram", "Discord", "Facebook", "GitHub", "GitLab",
    ]);
    expect(socialLinks.filter((link) => link.href).map((link) => link.label)).toEqual(["GitHub", "GitLab"]);
  });
  it("rejects unsafe or wrong-host configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_INSTAGRAM", "javascript:alert(1)");
    expect(configured("INSTAGRAM")).toBeUndefined();
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_INSTAGRAM", "https://evil.example/profile");
    expect(configured("INSTAGRAM")).toBeUndefined();
  });
});
