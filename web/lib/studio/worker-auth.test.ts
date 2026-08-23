import { describe, expect, it } from "vitest";
import { verifyWorkerAuthorization } from "./worker-auth";

describe("verifyWorkerAuthorization", () => {
  it("accepts only the exact bearer secret", () => {
    expect(verifyWorkerAuthorization("Bearer studio-worker", "studio-worker")).toBe(true);
    expect(verifyWorkerAuthorization("Bearer wrong", "studio-worker")).toBe(false);
    expect(verifyWorkerAuthorization(null, "studio-worker")).toBe(false);
    expect(verifyWorkerAuthorization("Bearer studio-worker", undefined)).toBe(false);
  });
});
