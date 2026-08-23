import { canPublish, transitionRelease } from "./social";
import { describe, expect, it } from "vitest";
describe("release lifecycle", () => {
  it("allows only ordered transitions and idempotent repeats", () => {
    expect(transitionRelease("draft", "ready")).toBe("ready");
    expect(transitionRelease("ready", "ready")).toBe("ready");
    expect(() => transitionRelease("draft", "published")).toThrow("invalid_release_transition");
  });
  it("requires approval confirmation before publish", () => {
    expect(canPublish("approved", true)).toBe(true);
    expect(canPublish("approved", false)).toBe(false);
    expect(canPublish("ready", true)).toBe(false);
  });
});
