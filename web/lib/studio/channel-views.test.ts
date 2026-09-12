import { describe, expect, it } from "vitest";
import {
  channelPageForPath,
  channelViewHref,
  resolveChannelView,
} from "./channel-views";

describe("channel views", () => {
  it("uses the exact dashboard route and never gives it a third-tier view", () => {
    expect(channelPageForPath("/app/channels/cinema")).toBe("dashboard");
    expect(channelPageForPath("/app/channels/cinema/")).toBe("dashboard");
    expect(resolveChannelView("dashboard", "anything")).toBeUndefined();
  });

  it("does not confuse channel ids or routes with shared prefixes", () => {
    expect(channelPageForPath("/app/channels/cinema-2/marketing")).toBe("marketing");
    expect(channelPageForPath("/app/channels/cinema-2/marketing-plan")).toBeUndefined();
    expect(channelPageForPath("/account")).toBeUndefined();
  });

  it("defaults missing and invalid views to the page default", () => {
    expect(resolveChannelView("staffing", null)?.id).toBe("hired");
    expect(resolveChannelView("staffing", "not-a-view")?.id).toBe("hired");
    expect(resolveChannelView("staffing", "custom")?.label).toBe("Custom Agents");
  });

  it("creates an allowlisted view link while retaining existing query state", () => {
    expect(channelViewHref("/app/channels/cinema/marketing", "workflow=weekly", "research")).toBe(
      "/app/channels/cinema/marketing?workflow=weekly&view=research"
    );
    expect(channelViewHref("/app/channels/cinema/marketing", "workflow=weekly", "bad")).toBeNull();
  });
});
