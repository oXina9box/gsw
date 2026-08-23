import { describe, expect, it } from "vitest";
import { enforceCap } from "../../lib/studio/caps";

describe("caps enforcement", () => {
  it("99% storage allows", () => {
    const r = enforceCap("storage_workspace_bytes", 99 * 1024 ** 3, 0);
    expect(r.allowed).toBe(true);
  });
  it("100% storage at limit allows, over denies", () => {
    const limit = 100 * 1024 ** 3;
    expect(enforceCap("storage_workspace_bytes", limit, 0).allowed).toBe(true);
    expect(enforceCap("storage_workspace_bytes", limit, 1).allowed).toBe(false);
  });
  it("concurrent reservation respects limit", () => {
    expect(enforceCap("jobs_workspace", 3, 1).allowed).toBe(true);
    expect(enforceCap("jobs_workspace", 4, 1).allowed).toBe(false);
  });
  it("policy unavailable denies", () => {
    const r = enforceCap("storage_workspace_bytes", 0, 1, false);
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("policy_unavailable");
  });
  it("upload batch file count boundary", () => {
    expect(enforceCap("upload_batch_files", 9, 1).allowed).toBe(true);
    expect(enforceCap("upload_batch_files", 10, 1).allowed).toBe(false);
  });
});
