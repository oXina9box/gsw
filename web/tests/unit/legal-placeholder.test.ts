import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const legalDir = path.resolve(__dirname, "../../content/legal");

describe("legal placeholder guard", () => {
  it("terms and privacy contain no TODO/placeholder/lorem", () => {
    for (const file of ["terms-of-service.md", "privacy-policy.md"]) {
      const p = path.join(legalDir, file);
      expect(existsSync(p), `${file} missing`).toBe(true);
      const raw = readFileSync(p, "utf-8");
      const content = raw
        .split("\n")
        .filter((l) => !l.includes("Draft notice"))
        .join("\n")
        .toLowerCase();
      for (const needle of ["todo", "placeholder", "lorem"]) {
        expect(content.includes(needle), `${file} contains ${needle}`).toBe(false);
      }
      expect(content.length, `${file} empty`).toBeGreaterThan(500);
    }
  });

  it("legal files exist and are non-empty", () => {
    const entries = readdirSync(legalDir);
    expect(entries).toContain("terms-of-service.md");
    expect(entries).toContain("privacy-policy.md");
  });
});
