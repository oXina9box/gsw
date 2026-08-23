import { createHash, randomUUID } from "node:crypto";

export type ReasonCode = "allowed" | "maintenance" | "emergency_stop" | "suspended" | "policy_unavailable" | "resource_forbidden" | "feature_unavailable" | "entitlement_required" | "quota_exhausted" | "invite_required" | "disabled" | "cap_exceeded";
export type CapabilityInput = Readonly<{
  principal: Readonly<{ userId: string; suspended: boolean }>;
  action: string;
  target: Readonly<{ type: string; id?: string; workspaceId: string; channelId?: string }>;
  membership: Readonly<{ workspaceId: string; role: "owner" | "editor" | "viewer"; channelIds: readonly string[] }> | null;
  launchMode: "owner" | "beta" | "public";
  feature: Readonly<{ available: boolean; providerAvailable: boolean; fresh: boolean }>;
  entitlement: Readonly<{ allowed: boolean; fresh: boolean }>;
  quota: Readonly<{ allowed: boolean; fresh: boolean }>;
  policy: Readonly<{ maintenance: boolean; emergency: boolean; workspaceSuspended: boolean; fresh: boolean }>;
}>;
export type CapabilityDecision = Readonly<{ allowed: boolean; reason: ReasonCode; action: string; target: CapabilityInput["target"]; evaluatedAt: string; policyVersion: "foundation-v1"; sourceFresh: boolean }>;

const deny = (input: CapabilityInput, reason: ReasonCode, sourceFresh = true): CapabilityDecision => Object.freeze({ allowed: false, reason, action: input.action, target: Object.freeze({ ...input.target }), evaluatedAt: new Date().toISOString(), policyVersion: "foundation-v1", sourceFresh });
export function evaluateCapability(input: CapabilityInput): CapabilityDecision {
  if (!input.policy.fresh || !input.feature.fresh || !input.entitlement.fresh || !input.quota.fresh) return deny(input, "policy_unavailable", false);
  if (input.policy.emergency) return deny(input, "emergency_stop");
  if (input.policy.maintenance) return deny(input, "maintenance");
  if (input.principal.suspended || input.policy.workspaceSuspended) return deny(input, "suspended");
  if (!input.membership || input.membership.workspaceId !== input.target.workspaceId || input.membership.role === "viewer" || (input.target.channelId && !input.membership.channelIds.includes(input.target.channelId))) return deny(input, "resource_forbidden");
  if (!input.feature.available || !input.feature.providerAvailable) return deny(input, "feature_unavailable");
  if (!input.entitlement.allowed) return deny(input, "entitlement_required");
  if (!input.quota.allowed) return deny(input, "quota_exhausted");
  return Object.freeze({ allowed: true, reason: "allowed", action: input.action, target: Object.freeze({ ...input.target }), evaluatedAt: new Date().toISOString(), policyVersion: "foundation-v1", sourceFresh: true });
}

export type OperationalAction = "signup" | "checkout" | "generation" | "publishing" | "uploads" | "orchestration";
export type OperationalPolicy = Partial<Record<OperationalAction, "enabled" | "disabled" | "invite_only">> & Readonly<{ maintenance?: boolean; workspaceSuspended?: boolean }>;
export function evaluateOperationalPolicy(action: OperationalAction, policy: OperationalPolicy, hasInvite: boolean) {
  if (policy.maintenance || policy.workspaceSuspended) return Object.freeze({ allowed: false, reason: policy.workspaceSuspended ? "suspended" : "maintenance" as ReasonCode });
  const state = policy[action] ?? "disabled";
  if (state === "invite_only" && !hasInvite) return Object.freeze({ allowed: false, reason: "invite_required" as ReasonCode });
  return Object.freeze({ allowed: state === "enabled" || (state === "invite_only" && hasInvite), reason: state === "disabled" ? "disabled" as ReasonCode : "allowed" as ReasonCode });
}

const blocked = /token|secret|password|authorization|cookie|payload|source/i;
export function createAuditEvent(input: Readonly<{ actorId?: string; workspaceId?: string; action: string; target: string; outcome: "allowed" | "denied" | "failed"; correlationId?: string; providerRequestId?: string; metadata?: Record<string, unknown> }>) {
  const metadata = Object.fromEntries(Object.entries(input.metadata ?? {}).filter(([key, value]) => !blocked.test(key) && typeof value !== "object"));
  return Object.freeze({ actorId: input.actorId, workspaceId: input.workspaceId, action: input.action, target: input.target, outcome: input.outcome, correlationId: input.correlationId ?? randomUUID(), timestamp: new Date().toISOString(), safeErrorClass: input.outcome === "failed" ? "operation_failed" : undefined, providerRequestId: input.providerRequestId, metadata: Object.freeze(metadata) });
}

export type EffectState = "requested" | "authorized" | "reserved" | "queued" | "claimed" | "running" | "completed" | "failed" | "reconciling" | "cancelled" | "dead" | "settling" | "settled" | "compensating" | "compensated";
export type DurableEffect = Readonly<{ idempotencyKey: string; payloadHash: string; kind: string; workspaceId: string; state: EffectState; lease?: string }>;
export function createEffect(input: Readonly<{ idempotencyKey: string; payload: unknown; kind: string; workspaceId: string }>, existing?: DurableEffect): DurableEffect {
  const payloadHash = createHash("sha256").update(JSON.stringify(input.payload)).digest("hex");
  if (existing) { if (existing.payloadHash !== payloadHash) throw new Error("idempotency_payload_mismatch"); return existing; }
  return Object.freeze({ ...input, payloadHash, state: "requested" });
}
const next: Readonly<Record<EffectState, readonly EffectState[]>> = { requested: ["authorized", "cancelled"], authorized: ["reserved", "cancelled"], reserved: ["queued", "compensating"], queued: ["claimed", "cancelled"], claimed: ["running", "queued"], running: ["completed", "failed", "reconciling", "dead"], completed: ["settling"], failed: ["settling", "compensating"], reconciling: ["completed", "failed", "dead"], cancelled: ["compensating"], dead: ["compensating"], settling: ["settled"], settled: [], compensating: ["compensated"], compensated: [] };
export function transitionEffect(effect: DurableEffect, state: EffectState, options: Readonly<{ lease?: string }> = {}): DurableEffect {
  if (!next[effect.state].includes(state)) throw new Error("invalid_effect_transition");
  if (["running", "completed", "failed", "reconciling", "dead"].includes(state) && effect.lease && effect.lease !== options.lease) throw new Error("lease_fenced");
  return Object.freeze({ ...effect, state, lease: options.lease ?? effect.lease });
}

type InventoryKind = "table" | "bucket" | "job" | "event" | "audit" | "invitation";
export type InventoryItem = Readonly<{ kind: InventoryKind; name: string }>;
const REGISTRY: Readonly<Record<string, Readonly<{ class: string; owner: string; retention: string; export: string; deletion: string; encryption: string; public: boolean; processors: readonly string[] }>>> = Object.freeze({
  "table:workspaces": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "closure purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:productions": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "closure purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:production_artifacts": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:production_events": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:production_approvals": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:dna_promotion_events": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:onboarding_profiles": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:assembly_decisions": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:release_packages": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:signal_promotion_events": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:production_lane_plans": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:production_dna_sheets": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:provider_handoff_artifacts": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase", "provider"] },
  "table:production_budget_guidelines": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:workflow_templates": { class: "product_configuration", owner: "platform", retention: "account lifetime", export: "no", deletion: "migration", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:social_reports": { class: "workspace_confidential", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:job_queue": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:genplay_shots": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "table:shot_clips": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "workspace export", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase Storage"] },
  "bucket:creative-assets": { class: "creative_assets", owner: "workspace", retention: "account lifetime", export: "authorized", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase Storage"] },
  "job:generate_text": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["provider"] },
  "job:generate_image": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["provider"] },
  "job:generate_audio": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["provider"] },
  "job:assemble_master": { class: "creative_assets", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["provider", "Supabase Storage"] },
  "job:provider_generation": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "reconcile then purge", encryption: "platform", public: false, processors: ["provider"] },
  "event:job_run": { class: "workspace_confidential", owner: "workspace", retention: "90 days", export: "metadata", deletion: "purge", encryption: "platform", public: false, processors: ["Supabase"] },
  "event:payment": { class: "financial", owner: "financial/audit", retention: "90 days", export: "redacted", deletion: "retention policy", encryption: "platform", public: false, processors: ["payment provider"] },
  "audit:security": { class: "security_audit", owner: "financial/audit", retention: "90 days", export: "redacted", deletion: "retention policy", encryption: "platform", public: false, processors: ["audit sink"] },
  "invitation:workspace": { class: "account_contact", owner: "account", retention: "expiry plus audit", export: "no", deletion: "expire", encryption: "platform", public: false, processors: ["Supabase Auth"] },
});
export function classifyInventory(items: readonly InventoryItem[]) { return items.map((item) => { const record = REGISTRY[`${item.kind}:${item.name}`]; if (!record) throw new Error("unclassified_inventory"); return Object.freeze({ ...item, ...record }); }); }

export const CAP_LIMITS = Object.freeze({ provider_spend_workspace_day: { limit: 25, warning: .7, reset: "UTC day" }, provider_spend_workspace_30d: { limit: 250, warning: .7, reset: "UTC 30 days" }, provider_spend_global_day: { limit: 35, warning: .7, reset: "UTC day" }, provider_spend_global_30d: { limit: 300, warning: .7, reset: "UTC 30 days" }, storage_workspace_bytes: { limit: 100 * 1024 ** 3, warning: .7, reset: "never" }, storage_global_bytes: { limit: 125 * 1024 ** 3, warning: .7, reset: "never" }, bandwidth_workspace_bytes: { limit: 250 * 1024 ** 3, warning: .7, reset: "UTC month" }, bandwidth_global_bytes: { limit: 300 * 1024 ** 3, warning: .7, reset: "UTC month" }, jobs_workspace: { limit: 4, warning: .75, reset: "lease expiry" }, jobs_global: { limit: 6, warning: .75, reset: "lease expiry" }, authenticated_reads_user: { limit: 120, warning: .7, reset: "UTC minute" }, authenticated_reads_workspace: { limit: 300, warning: .7, reset: "UTC minute" }, authenticated_writes_user: { limit: 30, warning: .7, reset: "UTC minute" }, authenticated_writes_workspace: { limit: 60, warning: .7, reset: "UTC minute" }, anonymous_requests_ip: { limit: 60, warning: .7, reset: "UTC minute" }, upload_file_bytes: { limit: 2 * 1024 ** 3, warning: .8, reset: "per file" }, upload_batch_files: { limit: 10, warning: .8, reset: "per batch" }, upload_batch_bytes: { limit: 5 * 1024 ** 3, warning: .8, reset: "per batch" }, upload_workspace_day_bytes: { limit: 20 * 1024 ** 3, warning: .7, reset: "UTC day" }, upload_workspace_day_files: { limit: 100, warning: .7, reset: "UTC day" }, retry_attempts: { limit: 3, warning: 2 / 3, reset: "30 minutes" } });
export type CapKey = keyof typeof CAP_LIMITS;
export function reserveCap(input: Readonly<{ key: CapKey; used: number; amount: number; policyAvailable: boolean; override?: Readonly<{ expiresAt: string }> }>) { const limit = CAP_LIMITS[input.key].limit; const override = input.override && new Date(input.override.expiresAt) > new Date(); if (!input.policyAvailable) return Object.freeze({ allowed: false, reason: "policy_unavailable" as ReasonCode }); return Object.freeze({ allowed: override || input.used + input.amount <= limit, reason: override || input.used + input.amount <= limit ? "allowed" as ReasonCode : "cap_exceeded" as ReasonCode, warning: input.used + input.amount >= limit * CAP_LIMITS[input.key].warning }); }

export type Infrastructure = Readonly<{ identity: "server"; workspaceData: "server"; storage: "server"; jobs: "server"; vault: "server"; email: "server"; payments: "server"; audit: "server" }>;
export const SERVER_INFRASTRUCTURE: Infrastructure = Object.freeze({ identity: "server", workspaceData: "server", storage: "server", jobs: "server", vault: "server", email: "server", payments: "server", audit: "server" });
