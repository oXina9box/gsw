import { describe, expect, it, vi } from "vitest";
import { getPublishedSiteContent } from "./content-server";
const createClient = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
describe("getPublishedSiteContent", () => {
  it("returns empty for query errors and signs stored media", async () => {
    const signed = vi.fn().mockResolvedValue({ data: { signedUrl: "https://cdn.example/image.png" }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: [{ id: "1", kind: "image", placement: "docs", audience: "public", status: "published", title: "T", body: "B", media_path: "site-editorial/a.png", starts_at: null, ends_at: null, published_at: "2026-01-01" }], error: null }) };
    createClient.mockResolvedValue({ from: () => query, storage: { from: () => ({ createSignedUrl: signed }) } });
    expect((await getPublishedSiteContent("docs"))[0].media_url).toBe("https://cdn.example/image.png");
    query.limit.mockResolvedValueOnce({ data: null, error: { code: "offline" } });
    expect(await getPublishedSiteContent("docs")).toEqual([]);
  });
});
