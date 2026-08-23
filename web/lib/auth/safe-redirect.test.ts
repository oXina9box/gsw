import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps local paths and rejects external redirects", () => {
    expect(safeRedirectPath("/app/productions?id=1#status")).toBe("/app/productions?id=1#status");
    expect(safeRedirectPath("https://attacker.example")).toBe("/app");
    expect(safeRedirectPath("//attacker.example")).toBe("/app");
    expect(safeRedirectPath("/\\attacker.example")).toBe("/app");
    expect(safeRedirectPath(null)).toBe("/app");
  });
});
