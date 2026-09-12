import { createClient } from "@/lib/supabase/server";

export type OperatorAccessFailure = "unauthenticated" | "mfa_required" | "not_operator" | "unavailable";
export type OperatorAccess = Readonly<{ ok: true; userId: string }> | Readonly<{ ok: false; reason: OperatorAccessFailure }>;

export function operatorGrantIsActive(grant: { revoked_at: string | null } | null | undefined) {
  return Boolean(grant && grant.revoked_at === null);
}

export function operatorMfaIsCurrent(assurance: { currentLevel?: string | null } | null | undefined) {
  return assurance?.currentLevel === "aal2";
}

export function operatorAccessError(reason: OperatorAccessFailure) {
  if (reason === "unauthenticated") return "Sign in to continue.";
  if (reason === "mfa_required") return "Two-step verification is required.";
  return "Administration access is unavailable.";
}

export async function getOperatorAccess(): Promise<OperatorAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!operatorMfaIsCurrent(assurance)) return { ok: false, reason: "mfa_required" };
  const { data: grant, error } = await supabase.from("site_operator_grants").select("revoked_at").eq("user_id", user.id).maybeSingle();
  if (error) return { ok: false, reason: "unavailable" };
  return operatorGrantIsActive(grant) ? { ok: true, userId: user.id } : { ok: false, reason: "not_operator" };
}

export async function requireOperator(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; userId: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!operatorMfaIsCurrent(assurance)) return null;
  const { data: grant, error } = await supabase.from("site_operator_grants").select("revoked_at").eq("user_id", user.id).maybeSingle();
  return !error && operatorGrantIsActive(grant) ? { supabase, userId: user.id } : null;
}
