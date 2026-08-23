import { describe, expect, it } from "vitest";
import { createAuditEvent, createEffect, transitionEffect } from "../../lib/studio/foundations";

describe("durable effect", () => {
  it("idempotent duplicate key returns same effect", () => {
    const a = createEffect({ idempotencyKey: "k1", payload: { x: 1 }, kind: "k", workspaceId: "w" });
    const b = createEffect({ idempotencyKey: "k1", payload: { x: 1 }, kind: "k", workspaceId: "w" }, a);
    expect(b.idempotencyKey).toBe(a.idempotencyKey);
    expect(b.payloadHash).toBe(a.payloadHash);
  });
  it("mismatched payload throws", () => {
    const a = createEffect({ idempotencyKey: "k1", payload: { x: 1 }, kind: "k", workspaceId: "w" });
    expect(() => createEffect({ idempotencyKey: "k1", payload: { x: 2 }, kind: "k", workspaceId: "w" }, a)).toThrow("idempotency_payload_mismatch");
  });
  it("lease loss blocks running transition", () => {
    const eff = createEffect({ idempotencyKey: "k2", payload: {}, kind: "k", workspaceId: "w" });
    const queued = transitionEffect(transitionEffect(transitionEffect(eff, "authorized"), "reserved"), "queued");
    const claimed = transitionEffect(queued, "claimed", { lease: "lease-a" });
    expect(() => transitionEffect(claimed, "running", { lease: "lease-b" })).toThrow("lease_fenced");
  });
  it("valid lease allows transition", () => {
    const eff = createEffect({ idempotencyKey: "k3", payload: {}, kind: "k", workspaceId: "w" });
    const queued = transitionEffect(transitionEffect(transitionEffect(eff, "authorized"), "reserved"), "queued");
    const claimed = transitionEffect(queued, "claimed", { lease: "lease-a" });
    const running = transitionEffect(claimed, "running", { lease: "lease-a" });
    expect(running.state).toBe("running");
  });
});

describe("audit redaction", () => {
  it("blocks token|secret keys and object values", () => {
    const evt = createAuditEvent({
      action: "test",
      target: "t",
      outcome: "allowed",
      metadata: { ok: "yes", token: "should-hide", secret: "hide", nested: { x: 1 } as unknown as string },
    });
    expect(evt.metadata).toEqual({ ok: "yes" });
    expect("token" in (evt.metadata as Record<string, unknown>)).toBe(false);
    expect("nested" in (evt.metadata as Record<string, unknown>)).toBe(false);
  });
});
