import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublishedContent } from "@/components/site/published-content";
const reader = vi.hoisted(() => vi.fn());
vi.mock("@/lib/site/content-server", () => ({ getPublishedSiteContent: reader }));
describe("PublishedContent", () => {
  it("collapses empty content and renders safe media/download affordances", async () => {
    reader.mockResolvedValueOnce([]);
    expect(await PublishedContent({ placement: "docs" })).toBeNull();
    reader.mockResolvedValueOnce([{ id: "1", kind: "document", title: "Guide", body: "<b>plain</b>", media_url: "https://cdn.example/guide.pdf", alt_text: null, cta_url: "https://example.com", cta_label: "Read", placement: "docs", audience: "public", status: "published", starts_at: null, ends_at: null }]);
    const html = renderToStaticMarkup(await PublishedContent({ placement: "docs" }));
    expect(html).toContain("&lt;b&gt;plain&lt;/b&gt;");
    expect(html).toContain("Download document");
  });
});
