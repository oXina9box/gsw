import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, maskSecret, resolveSecretKey } from "./secrets";

describe("provider secret envelope", () => {
  it("round trips without storing plaintext", () => {
    const key = randomBytes(32).toString("base64");
    const envelope = encryptSecret("provider-secret", key, "v1");
    expect(JSON.stringify(envelope)).not.toContain("provider-secret");
    expect(decryptSecret(envelope, key)).toBe("provider-secret");
  });

  it("rejects malformed encryption keys", () => {
    expect(() => encryptSecret("secret", "bad", "v1")).toThrow("32-byte");
  });

  it("masks secrets without exposing short values", () => {
    expect(maskSecret("abcdef123456")).toBe("••••3456");
    expect(maskSecret("abc")).toBe("••••");
  });

  it("resolves current and retained rotation keys", () => {
    const current = randomBytes(32).toString("base64");
    const previous = randomBytes(32).toString("base64");
    expect(resolveSecretKey("v2", "v2", current)).toBe(current);
    expect(resolveSecretKey("v1", "v2", current, JSON.stringify({ v1: previous }))).toBe(previous);
    expect(() => resolveSecretKey("v0", "v2", current)).toThrow("unavailable");
  });
});
