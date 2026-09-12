import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ user: null, assurance: { currentLevel: "aal2" }, grant: null, grantError: null }));
type AccessState = { user: { id: string } | null; assurance: { currentLevel: string }; grant: { revoked_at: string | null } | null; grantError: Error | null };
const mutable = state as unknown as AccessState;
const createClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createClient }));
function client() { return { auth: { getUser: vi.fn(async () => ({ data: { user: mutable.user } })), mfa: { getAuthenticatorAssuranceLevel: vi.fn(async () => ({ data: mutable.assurance })) } }, from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: mutable.grant, error: mutable.grantError })) })) })) })) }; }
import { getOperatorAccess, requireOperator } from "@/lib/studio/operator-access";
describe("operator access server boundary", () => {
  beforeEach(() => { mutable.user = { id: "user-1" }; mutable.assurance = { currentLevel: "aal2" }; mutable.grant = { revoked_at: null }; mutable.grantError = null; createClient.mockResolvedValue(client()); });
  it("denies anonymous, MFA step-up, revoked, and unavailable grants", async () => { mutable.user = null; expect(await getOperatorAccess()).toEqual({ ok: false, reason: "unauthenticated" }); mutable.user = { id: "user-1" }; mutable.assurance = { currentLevel: "aal1" }; expect(await getOperatorAccess()).toEqual({ ok: false, reason: "mfa_required" }); mutable.assurance = { currentLevel: "aal2" }; mutable.grant = { revoked_at: "2026-09-11T00:00:00Z" }; expect(await getOperatorAccess()).toEqual({ ok: false, reason: "not_operator" }); mutable.grant = { revoked_at: null }; mutable.grantError = new Error("db"); expect(await getOperatorAccess()).toEqual({ ok: false, reason: "unavailable" }); });
  it("returns identity only for current aal2 access", async () => { expect(await getOperatorAccess()).toEqual({ ok: true, userId: "user-1" }); expect(await requireOperator()).toMatchObject({ userId: "user-1" }); mutable.grant = { revoked_at: "revoked" }; expect(await requireOperator()).toBeNull(); });
});
