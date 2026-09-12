import { describe, expect, it } from "vitest";
import { contentInputFromForm, effectiveContent, safeEditorialUrl } from "@/lib/site/content";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("site editorial boundaries", () => {
  it("accepts bounded plain editorial input and safe HTTPS destinations", () => {
    const input = contentInputFromForm(form({ kind: "tip", placement: "site-slot", audience: "public", title: "Use a shot list", body: "Keep each cut intentional.", cta_label: "Read guide", cta_url: "https://example.com/guide", alt_text: "Storyboard notes", starts_at: "", ends_at: "" }));
    expect(input).toMatchObject({ kind: "tip", placement: "site-slot", ctaUrl: "https://example.com/guide" });
    expect(safeEditorialUrl("javascript:alert(1)")).toBeNull();
    expect(safeEditorialUrl("http://localhost:3000")).toBeNull();
  });

  it("only exposes effective published records in the requested audience and placement", () => {
    const now = new Date("2026-09-10T12:00:00Z");
    expect(effectiveContent([
      { id: "one", kind: "tip", placement: "site-slot", audience: "public", status: "published", starts_at: "2026-09-10T11:00:00Z", ends_at: null },
      { id: "two", kind: "banner", placement: "site-slot", audience: "public", status: "draft", starts_at: null, ends_at: null },
      { id: "three", kind: "tip", placement: "site-slot", audience: "member", status: "published", starts_at: null, ends_at: null },
    ], "site-slot", "public", now).map((item) => item.id)).toEqual(["one"]);
  });
});
