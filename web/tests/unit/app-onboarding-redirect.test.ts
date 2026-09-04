import { describe, expect, it } from "vitest";

import { shouldRedirectToOnboarding } from "@/lib/studio/onboarding";

describe("legacy onboarding progress helper", () => {
  it("reports whether setup is incomplete without controlling access", () => {
    expect(shouldRedirectToOnboarding("complete")).toBe(false);
    expect(shouldRedirectToOnboarding("identity")).toBe(true);
    expect(shouldRedirectToOnboarding(null)).toBe(true);
  });
});
