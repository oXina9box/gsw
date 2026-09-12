import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChannelDashboardClient } from "@/components/product/channel-dashboard-client";

const channel = { id: "channel-a", name: "Actual studio", status: "active", audience: null, voice: null, cadence: null, pillars: null };
const production = { id: "prod-a", title: "Saved film", status: "running", current_step: 2, step_count: 13, run_mode: "manual", scheduled_at: "2026-10-01T18:00:00Z", updated_at: "2026-09-10T00:00:00Z" };

describe("truthful channel dashboard", () => {
  it("renders persisted productions and their schedule without fabricated analytics", () => {
    const html = renderToStaticMarkup(createElement(ChannelDashboardClient, { channel, productions: [production] }));
    expect(html).toContain("Saved film");
    expect(html).toMatch(/datetime="2026-10-01T18:00:00Z"/i);
    for (const fake of ["4.8M", "74.2%", "24.8 GB", "18.4k", "284k", "84,200", "$14,280", "Cyberpunk Neon Hoodie", "100% jobs succeeded"]) {
      expect(html).not.toContain(fake);
    }
    expect(html).not.toContain("Consistent Studio Tone");
    expect(html).toContain("Not set");
  });

  it("shows an honest empty slate instead of a schedule or unsupported metrics", () => {
    const html = renderToStaticMarkup(createElement(ChannelDashboardClient, { channel, productions: [] }));
    expect(html).toContain("No productions yet");
    expect(html).toContain("No scheduled productions");
    expect(html).not.toContain("Oct 12");
    expect(html).not.toContain("Total Audience Reach");
  });
});
