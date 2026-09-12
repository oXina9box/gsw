import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const filler = /\b(?:lorem|ipsum|duis|consectetur|adipiscing|eiusmod|ullamco|veniam|excepteur|cillum)\b|nisi ut|sed do|tempor incididunt/i;
const pages = ["studio", "system", "social-workshop", "gallery", "portfolio", "do-not-click", "contact"];
const authPages = ["login", "forgot-password", "reset-password", "verify-email", "mfa"];
const files = [
  ...pages.map((name) => `app/(marketing)/${name}/page.tsx`),
  ...authPages.map((name) => `app/(auth)/${name}/page.tsx`),
  "app/(marketing)/not-found.tsx", "components/shell/site-footer.tsx",
];
describe("approved nonlegal public copy", () => {
  it("detects the removed filler vocabulary", () => {
    expect(filler.test("Duis aute irure dolor" )).toBe(true);
    expect(filler.test("Ut enim ad minim veniam")).toBe(true);
  });
  it.each(files)("%s contains product copy rather than Latin filler", (file) => {
    expect(readFileSync(path.resolve(__dirname, "../..", file), "utf8")).not.toMatch(filler);
  });
});
