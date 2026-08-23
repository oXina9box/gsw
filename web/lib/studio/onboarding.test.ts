import { describe, expect, it } from "vitest";
import { nextOnboardingStep } from "./onboarding";
describe("onboarding transitions", () => {
  it("requires ordered steps and permits retry", () => {
    expect(nextOnboardingStep(null, "identity")).toBe("identity");
    expect(nextOnboardingStep(null, "channel")).toBeNull();
    expect(nextOnboardingStep("identity", "identity")).toBe("identity");
    expect(nextOnboardingStep("identity", "channel")).toBe("channel");
    expect(nextOnboardingStep("identity", "complete")).toBeNull();
  });
});
