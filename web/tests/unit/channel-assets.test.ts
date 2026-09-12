import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/components/product/use-channel-view", () => ({ useChannelView: () => ({ activeView: "content" }) }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => createElement("a", props, children) }));
import { AssetPreview, ChannelAssetsClient } from "@/components/product/channel-assets-client";

const base = { channelId: "c", channelName: "Channel", bytesUsed: 0, dnaItems: [] };
function markup(downloadUrl: string | null) { return renderToStaticMarkup(createElement(ChannelAssetsClient, { ...base, assetItems: [{ id: "a", kind: "image", uri: "creative/still.png", downloadUrl, metadata: null, created_at: "2026-01-01T00:00:00Z", productionTitle: "Film" }] })); }
describe("channel asset downloads", () => {
  it("uses the signed URL for download and preview", () => { const html = markup("https://signed.example/a"); const preview = renderToStaticMarkup(createElement(AssetPreview, { asset: { id: "a", kind: "image", uri: "creative/still.png", downloadUrl: "https://signed.example/a", metadata: null, created_at: "2026-01-01T00:00:00Z", productionTitle: "Film" } })); expect(html).toContain('href="https://signed.example/a"'); expect(preview).toContain("<img"); expect(preview).toContain("https://signed.example/a"); });
  it("does not link raw storage paths when signing is unavailable", () => { const html = markup(null); const preview = renderToStaticMarkup(createElement(AssetPreview, { asset: { id: "a", kind: "image", uri: "creative/still.png", downloadUrl: null, metadata: null, created_at: "2026-01-01T00:00:00Z", productionTitle: "Film" } })); expect(html).toContain("Download unavailable"); expect(preview).toContain("Preview unavailable until a signed URL is available."); expect(html).not.toContain('href="creative/still.png"'); expect(preview).not.toContain("Direct Stream Preview Seam"); });
});
