import { describe, expect, it } from "vitest";
import { moderationInputFromForm, reviewOutcomeIsReversible } from "@/lib/studio/moderation";

describe("manual review boundaries", () => {
  it("requires a bounded reason and allows only reversible review outcomes", () => {
    expect(moderationInputFromForm(new FormData())).toBeNull();
    const data = new FormData();
    data.set("case_type", "content"); data.set("outcome", "quarantined"); data.set("reason", "Violates the selected review policy."); data.set("target_id", "11111111-1111-4111-8111-111111111111");
    expect(moderationInputFromForm(data)).toMatchObject({ caseType: "content", outcome: "quarantined" });
    expect(reviewOutcomeIsReversible("quarantined")).toBe(true);
    expect(reviewOutcomeIsReversible("merge")).toBe(false);
  });
});
