import { describe, expect, it } from "vitest";
import { decideAdvancement } from "../../lib/studio/domain";

const base = { currentStep: 4, totalSteps: 13, pendingApprovals: 0, lastJobSucceeded: true };

describe("decideAdvancement", () => {
  it("never advances manual or failed work", () => {
    expect(decideAdvancement({ ...base, runMode: "manual" })).toEqual({ advanceStep: false, enqueueNext: false, reason: "manual" });
    expect(decideAdvancement({ ...base, runMode: "auto", lastJobSucceeded: false })).toEqual({ advanceStep: false, enqueueNext: false, reason: "job_failed" });
  });

  it("stops complete work and approval-gated work", () => {
    expect(decideAdvancement({ ...base, runMode: "auto", currentStep: 13 })).toEqual({ advanceStep: false, enqueueNext: false, reason: "complete" });
    expect(decideAdvancement({ ...base, runMode: "auto", pendingApprovals: 1 })).toEqual({ advanceStep: false, enqueueNext: false, reason: "awaiting_approval" });
  });

  it("advances semi-auto and queues only auto", () => {
    expect(decideAdvancement({ ...base, runMode: "semi_auto" })).toEqual({ advanceStep: true, enqueueNext: false, reason: "advanced" });
    expect(decideAdvancement({ ...base, runMode: "auto" })).toEqual({ advanceStep: true, enqueueNext: true, reason: "advanced" });
  });
});
