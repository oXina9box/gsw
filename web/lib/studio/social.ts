export type ReleaseStatus = "draft" | "ready" | "approved" | "published";
const next: Record<ReleaseStatus, readonly ReleaseStatus[]> = { draft: ["ready"], ready: ["approved"], approved: ["published"], published: [] };
export function transitionRelease(status: ReleaseStatus, target: ReleaseStatus): ReleaseStatus {
  if (status === target) return status;
  if (!next[status].includes(target)) throw new Error("invalid_release_transition");
  return target;
}
export function canPublish(status: ReleaseStatus, confirmed: boolean) { return status === "approved" && confirmed; }
