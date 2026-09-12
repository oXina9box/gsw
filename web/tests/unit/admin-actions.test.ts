import { describe, expect, it } from "vitest";
import { contentInputFromForm } from "@/lib/site/content";
import { moderationInputFromForm } from "@/lib/studio/moderation";

describe("administration form boundaries", () => {
  it("rejects unsafe editorial links and malformed content", () => {
    const form = new FormData();
    form.set("kind", "banner"); form.set("placement", "account"); form.set("audience", "public"); form.set("title", "Hello"); form.set("body", "Body"); form.set("cta_url", "javascript:alert(1)");
    expect(contentInputFromForm(form)).toBeNull();
  });
  it("requires a reason and UUID for review actions", () => {
    const form = new FormData(); form.set("case_type", "content"); form.set("outcome", "quarantined"); form.set("target_id", "not-a-uuid"); form.set("reason", "no");
    expect(moderationInputFromForm(form)).toBeNull();
  });
  it("accepts only parser-approved enforcement combinations", () => {
    const form = new FormData();
    form.set("case_type", "content"); form.set("subject_kind", "account"); form.set("outcome", "suspended"); form.set("target_id", "00000000-0000-4000-8000-000000000001"); form.set("reason", "Policy review required");
    expect(moderationInputFromForm(form)?.subjectKind).toBe("account");
    form.set("subject_kind", "asset"); form.set("outcome", "suspended");
    expect(moderationInputFromForm(form)).toBeNull();
  });
  it("requires media metadata for document and image content", () => {
    const form = new FormData();
    form.set("kind", "document"); form.set("placement", "help"); form.set("audience", "public"); form.set("title", "Guide"); form.set("body", "Read this");
    expect(contentInputFromForm(form)).toBeNull();
  });
});
