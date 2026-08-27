import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/studio/workspace", () => ({ getWorkspaceContext: vi.fn() }));
import { shouldRedirectToOnboarding } from "@/app/(product)/app/page";

describe("authenticated app onboarding gate", () => {
  it("keeps completed studios in Front Office", () => {
    expect(shouldRedirectToOnboarding("complete")).toBe(false);
  });

  it.each([undefined, null, "identity", "channel", "hiring", "unknown"]) (
    "redirects incomplete step %s to setup",
    (step) => expect(shouldRedirectToOnboarding(step)).toBe(true),
  );
});
