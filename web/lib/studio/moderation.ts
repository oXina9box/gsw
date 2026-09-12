export const REVIEW_CASE_TYPES = ["duplicate", "content"] as const;
export const REVIEW_OUTCOMES = ["dismissed", "confirmed", "request_changes", "quarantined", "released", "suspended", "restored"] as const;
export type ReviewCaseType = (typeof REVIEW_CASE_TYPES)[number];
export type ReviewOutcome = (typeof REVIEW_OUTCOMES)[number];

export function reviewOutcomeIsReversible(value: unknown): value is ReviewOutcome {
  return typeof value === "string" && (REVIEW_OUTCOMES as readonly string[]).includes(value);
}

export function moderationInputFromForm(formData: FormData): { caseType: ReviewCaseType; subjectKind: "account" | "asset"; outcome: ReviewOutcome; reason: string; targetId: string } | null {
  const caseType = String(formData.get("case_type") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const subjectKind = String(formData.get("subject_kind") ?? (caseType === "duplicate" ? "account" : "asset"));
  const reason = String(formData.get("reason") ?? "").trim();
  const targetId = String(formData.get("target_id") ?? "").trim();
  if (!(REVIEW_CASE_TYPES as readonly string[]).includes(caseType) || !reviewOutcomeIsReversible(outcome) || reason.length < 3 || reason.length > 2_000 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId)) return null;
  if (!["account", "asset"].includes(subjectKind)) return null;
  if (caseType === "duplicate" && (subjectKind !== "account" || !["dismissed", "confirmed"].includes(outcome))) return null;
  if (caseType === "content" && !(subjectKind === "account" ? ["dismissed", "request_changes", "suspended", "restored"] : ["dismissed", "request_changes", "quarantined", "released"]).includes(outcome)) return null;
  return { caseType: caseType as ReviewCaseType, subjectKind: subjectKind as "account" | "asset", outcome, reason, targetId };
}
