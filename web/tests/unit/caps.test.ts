import { describe, expect, it } from "vitest";
import { enforceCap, evaluateClipUploadAdmission, evaluateJobAdmission } from "../../lib/studio/caps";

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

describe("job admission", () => {
  it("admits only below workspace and global concurrency caps", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 3, globalRunning: 5, policyAvailable: true })).toEqual({ admit: true, reason: "allowed" });
    expect(evaluateJobAdmission({ workspaceRunning: 4, globalRunning: 5, policyAvailable: true })).toEqual({ admit: false, reason: "cap_exceeded" });
    expect(evaluateJobAdmission({ workspaceRunning: 3, globalRunning: 6, policyAvailable: true })).toEqual({ admit: false, reason: "cap_exceeded" });
  });
  it("fails closed without policy", () => {
    expect(evaluateJobAdmission({ workspaceRunning: 0, globalRunning: 0, policyAvailable: false })).toEqual({ admit: false, reason: "policy_unavailable" });
  });
});

describe("clip upload admission", () => {
  const normal = { byteSize: 1024, filesToday: 3, bytesToday: 4096, policyAvailable: true };
  it("admits only under file and daily caps", () => {
    expect(evaluateClipUploadAdmission(normal)).toEqual({ admit: true, reason: "allowed" });
    expect(evaluateClipUploadAdmission({ ...normal, byteSize: 2 * 1024 ** 3 + 1 }).admit).toBe(false);
    expect(evaluateClipUploadAdmission({ ...normal, filesToday: 100 }).admit).toBe(false);
    expect(evaluateClipUploadAdmission({ ...normal, bytesToday: 20 * 1024 ** 3 }).admit).toBe(false);
  });
});
