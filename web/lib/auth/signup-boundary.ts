import { evaluateOperationalPolicy } from "@/lib/studio/foundations";
export type SignupMode = "disabled" | "invite_only" | "enabled";
export type SignupDecision = Readonly<{ allowed: boolean; reason: "allowed" | "signup_disabled" | "invite_required" | "invalid_callback" }>;
const CALLBACKS = new Set(["/auth/callback", "/auth/confirm", "/reset-password"]);
export function authorizeSignup(input: Readonly<{ mode: SignupMode; invite: Readonly<{ email: string; audience: "account"; expiresAt: string }> | null; callback: string }>): SignupDecision {
  if (!CALLBACKS.has(input.callback)) return Object.freeze({ allowed: false, reason: "invalid_callback" });
  if (input.mode === "disabled") return Object.freeze({ allowed: false, reason: "signup_disabled" });
  if (input.mode === "invite_only" && (!input.invite || new Date(input.invite.expiresAt) <= new Date())) return Object.freeze({ allowed: false, reason: "invite_required" });
  return Object.freeze({ allowed: true, reason: "allowed" });
}
export function evaluateSignupPolicy(policy: Parameters<typeof evaluateOperationalPolicy>[1], hasInvite: boolean) {
  return evaluateOperationalPolicy("signup", policy, hasInvite);
}
