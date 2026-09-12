import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteTipSlot } from "@/components/product/site-tip-slot";
const item = (id: string) => ({ id, kind: "tip" as const, placement: "home", audience: "public" as const, status: "published" as const, title: `Tip ${id}`, body: "Make a frame.", starts_at: null, ends_at: null });
describe("SiteTipSlot", () => { it("handles empty and multiple content", () => { expect(renderToStaticMarkup(<SiteTipSlot items={[]} />)).toBe(""); expect(renderToStaticMarkup(<SiteTipSlot items={[item("a"), item("b")]} />)).toContain("Next update"); }); });
