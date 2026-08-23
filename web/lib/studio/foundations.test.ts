import { describe, expect, it } from "vitest";
import {
  CAP_LIMITS,
  classifyInventory,
  createAuditEvent,
  createEffect,
  evaluateCapability,
  evaluateOperationalPolicy,
  reserveCap,
  transitionEffect,
  type CapabilityInput,
} from "./foundations";

const input = (patch: Partial<CapabilityInput> = {}): CapabilityInput => ({
  principal: { userId: "user", suspended: false },
  target: { type: "channel", id: "channel", workspaceId: "workspace", channelId: "channel" },
  action: "generation",
  membership: { workspaceId: "workspace", role: "owner", channelIds: ["channel"] },
  launchMode: "owner",
  feature: { available: true, providerAvailable: true, fresh: true },
  entitlement: { allowed: true, fresh: true },
  quota: { allowed: true, fresh: true },
  policy: { maintenance: false, emergency: false, workspaceSuspended: false, fresh: true },
  ...patch,
});

describe("F01/F02 capability and operational policy", () => {
  it("RED: denies by required precedence and returns immutable metadata", () => {
    const decision = evaluateCapability(input({ policy: { maintenance: true, emergency: false, workspaceSuspended: false, fresh: true } }));
    expect(decision).toMatchObject({ allowed: false, reason: "maintenance" });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(evaluateCapability(input({ membership: { workspaceId: "workspace", role: "viewer", channelIds: [] } })).reason).toBe("resource_forbidden");
    expect(evaluateOperationalPolicy("signup", { signup: "invite_only" }, false).reason).toBe("invite_required");
    expect(evaluateOperationalPolicy("checkout", { checkout: undefined }, false)).toMatchObject({ allowed: false, reason: "disabled" });
    expect(evaluateOperationalPolicy("checkout", { checkout: "enabled" }, false)).toMatchObject({ allowed: true, reason: "allowed" });
  });
});

describe("F04/F05 audit and durable effects", () => {
  it("RED: redacts audit data and rejects idempotency payload mismatch", () => {
    expect(createAuditEvent({ actorId: "user", workspaceId: "workspace", action: "publish", target: "post", outcome: "denied", metadata: { token: "secret", title: "ok" } }).metadata).toEqual({ title: "ok" });
    const effect = createEffect({ idempotencyKey: "key", payload: { a: 1 }, kind: "publication", workspaceId: "workspace" });
    expect(transitionEffect(effect, "authorized", { lease: "lease" }).state).toBe("authorized");
    expect(() => createEffect({ idempotencyKey: "key", payload: { a: 2 }, kind: "publication", workspaceId: "workspace" }, effect)).toThrow("idempotency_payload_mismatch");
  });
});

describe("F06/F07/F08 registry, boundaries, caps", () => {
  it("RED: rejects unclassified inventory and atomically stops caps", () => {
    expect(() => classifyInventory([{ kind: "table", name: "missing" }])).toThrow("unclassified_inventory");
    expect(classifyInventory([{ kind: "table", name: "workspaces" }])[0].class).toBe("workspace_confidential");
    const reserved = reserveCap({ key: "provider_spend_workspace_day", used: 24, amount: 1, policyAvailable: true });
    expect(reserved.allowed).toBe(true);
    expect(reserveCap({ key: "provider_spend_workspace_day", used: 25, amount: 1, policyAvailable: true }).reason).toBe("cap_exceeded");
    expect(reserveCap({ key: "provider_spend_workspace_day", used: 0, amount: 1, policyAvailable: false }).reason).toBe("policy_unavailable");
    expect(CAP_LIMITS.upload_file_bytes.limit).toBe(2 * 1024 ** 3);
  });
});
