"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { moderationInputFromForm } from "@/lib/studio/moderation";
import { requireOperator } from "@/lib/studio/operator-access";
export async function recordSiteReview(formData: FormData) {
  const operator = await requireOperator();
  if (!operator) redirect("/account?section=administration&admin_error=unauthorized");
  const input = moderationInputFromForm(formData);
  if (!input) redirect("/account?section=administration&admin_error=invalid_review");
  const { error } = await operator.supabase.rpc("site_record_review", { case_kind: input.caseType, subject_kind: input.subjectKind, subject_id: input.targetId, review_outcome: input.outcome, action_reason: input.reason });
  if (error) redirect(`/account?section=administration&admin_error=${error.message.includes("reason") ? "reason_required" : "review_failed"}`);
  revalidatePath("/account"); redirect("/account?section=administration&admin_saved=1");
}
