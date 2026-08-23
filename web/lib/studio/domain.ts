export const DEPARTMENTS = [
  "Research",
  "Marketing",
  "Creative",
  "Story",
  "Storyboard",
  "Script",
  "Screenplay",
  "AI Conversion",
  "Video Production",
  "Launch",
  "Social Posting",
  "Social Management",
  "Reporting",
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];
export type RunMode = "manual" | "semi_auto" | "auto";

export const JOB_KINDS = ["generate_text", "generate_image", "generate_audio", "assemble_master"] as const;
export type JobKind = (typeof JOB_KINDS)[number];
export const ASSEMBLY_CLIP_MIME = "video/mp4";
export const MAX_CLIP_BYTES = 100 * 1024 * 1024;

const RUN_MODES = new Set<RunMode>(["manual", "semi_auto", "auto"]);

export function normalizeRunMode(value: unknown): RunMode {
  return typeof value === "string" && RUN_MODES.has(value as RunMode) ? value as RunMode : "manual";
}

export function isJobKind(value: unknown): value is JobKind {
  return typeof value === "string" && (JOB_KINDS as readonly string[]).includes(value);
}

export function isAssemblyClip(mime: string, bytes: number) {
  return mime === ASSEMBLY_CLIP_MIME && Number.isSafeInteger(bytes) && bytes > 0 && bytes <= MAX_CLIP_BYTES;
}

export function safeInternalPath(value: string | null | undefined, fallback = "/app") {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

const PRIVATE_HOST = /^(?:localhost|0\.|127\.|10\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|198\.(?:1[89])\.|22[4-9]\.|23\d\.|24\d\.|25[0-5]\.|\[?(?:::1|f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:))/i;

export function normalizeProviderBaseUrl(value: string, allowLocal: boolean, allowedHosts: readonly string[] = []) {
  const url = new URL(value);
  const local = PRIVATE_HOST.test(url.hostname) || url.hostname.endsWith(".local");
  if ((!allowLocal && (url.protocol !== "https:" || local)) || (allowLocal && !["http:", "https:"].includes(url.protocol))) {
    throw new Error("Provider URL must use public HTTPS");
  }
  if (!allowLocal && (url.port && url.port !== "443")) throw new Error("Provider URL must use port 443");
  if (!allowLocal && (!allowedHosts.length || !allowedHosts.includes(url.hostname.toLowerCase()))) throw new Error("Provider host is not allowlisted");
  if (url.username || url.password) throw new Error("Provider URL must not contain credentials");
  return url.toString().replace(/\/$/, "");
}

export function validateCreditAmount(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Credit amount must be a positive integer");
  return value;
}

export function creditBalance(entries: ReadonlyArray<{ amount: number }>) {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

export function textField(formData: FormData, name: string, maxLength = 120) {
  const value = String(formData.get(name) ?? "").trim();
  return value && value.length <= maxLength ? value : null;
}

export type AdvancementReason = "job_failed" | "complete" | "manual" | "awaiting_approval" | "advanced";
export type AdvancementDecision = Readonly<{ advanceStep: boolean; enqueueNext: boolean; reason: AdvancementReason }>;

export function decideAdvancement(input: Readonly<{ runMode: RunMode; currentStep: number; totalSteps: number; pendingApprovals: number; lastJobSucceeded: boolean }>): AdvancementDecision {
  if (!input.lastJobSucceeded) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "job_failed" });
  if (input.currentStep >= input.totalSteps) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "complete" });
  if (input.runMode === "manual") return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "manual" });
  if (input.pendingApprovals > 0) return Object.freeze({ advanceStep: false, enqueueNext: false, reason: "awaiting_approval" });
  return Object.freeze({ advanceStep: true, enqueueNext: input.runMode === "auto", reason: "advanced" });
}
