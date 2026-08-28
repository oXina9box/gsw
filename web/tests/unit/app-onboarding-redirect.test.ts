import { describe, expect, it } from "vitest";

import { shouldRedirectToOnboarding } from "@/lib/studio/onboarding";

describe("authenticated app onboarding gate", () => {
  it("keeps completed studios in Front Office", () => {
    expect(shouldRedirectToOnboarding("complete")).toBe(false);
  });

  it.each([undefined, null, "identity", "channel", "hiring", "unknown"]) (
    "redirects incomplete step %s to setup",
    (step) => expect(shouldRedirectToOnboarding(step)).toBe(true),
  );
});
