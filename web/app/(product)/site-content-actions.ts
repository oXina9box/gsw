"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { contentInputFromForm } from "@/lib/site/content";
import { requireOperator } from "@/lib/studio/operator-access";

const MAX_UPLOAD = 10 * 1024 * 1024;
const MIME_EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "application/pdf": "pdf" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (code: string): never => redirect(`/account?section=administration&admin_error=${code}`);

export async function saveSiteContent(formData: FormData) {
  const operator = await requireOperator();
  if (!operator) fail("unauthorized");
  if (!operator) return;
  const id = String(formData.get("id") ?? "").trim() || null;
  const revision = Number(formData.get("revision") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  if ((id && !UUID.test(id)) || !Number.isSafeInteger(revision) || revision < 0 || reason.length < 3 || reason.length > 2_000) fail("invalid_content");
  const file = formData.get("media_file");
  const plannedPath = file instanceof File && file.size ? `site-editorial/${id ?? "new"}/${revision + 1}-${randomUUID()}.${MIME_EXT[file.type] ?? "invalid"}` : null;
  const validationForm = new FormData();
  formData.forEach((value, key) => validationForm.append(key, value));
  if (plannedPath) validationForm.set("media_path", plannedPath);
  const input = contentInputFromForm(validationForm);
  if (!input) fail("invalid_content");
  if (!input) return;
  let mediaPath = input.mediaPath;
  if (file instanceof File && file.size) {
    const ext = MIME_EXT[file.type];
    if (!ext || file.size > MAX_UPLOAD) fail("invalid_media");
    const path = plannedPath as string;
    const { error } = await operator.supabase.storage.from("site-editorial").upload(path, file, { contentType: file.type, upsert: false });
    if (error) fail("upload_failed");
    mediaPath = path;
  }
  if ((input.kind === "image" || input.kind === "document") && !mediaPath) fail("invalid_media");
  const { error } = await operator.supabase.rpc("site_save_content", {
    target_content: id,
    expected_revision: revision,
    next_content: { kind: input.kind, placement: input.placement, audience: input.audience, title: input.title, body: input.body, cta_label: input.ctaLabel, cta_url: input.ctaUrl, media_path: mediaPath, alt_text: input.altText, starts_at: input.startsAt, ends_at: input.endsAt },
    action_reason: reason,
  });
  if (error) fail(error.message.includes("reason") ? "reason_required" : error.message.includes("conflict") ? "conflict" : "save_failed");
  revalidatePath("/account"); revalidatePath("/", "layout");
  redirect("/account?section=administration&admin_saved=1");
}

export async function setSiteContentPublication(formData: FormData) {
  const operator = await requireOperator();
  if (!operator) fail("unauthorized");
  if (!operator) return;
  const id = String(formData.get("id") ?? "").trim(); const revision = Number(formData.get("revision")); const reason = String(formData.get("reason") ?? "").trim(); const publish = String(formData.get("publish") ?? "");
  if (!UUID.test(id) || !Number.isSafeInteger(revision) || revision < 1 || !["true", "false"].includes(publish) || reason.length < 3 || reason.length > 2_000) fail("invalid_content");
  const { error } = await operator.supabase.rpc("site_set_content_publication", { target_content: id, expected_revision: revision, publish: publish === "true", action_reason: reason });
  if (error) fail(error.message.includes("reason") ? "reason_required" : "publish_failed");
  revalidatePath("/account"); revalidatePath("/", "layout"); redirect("/account?section=administration&admin_saved=1");
}

export async function restoreSiteContentRevision(formData: FormData) {
  const operator = await requireOperator();
  if (!operator) fail("unauthorized");
  if (!operator) return;
  const id = String(formData.get("id") ?? "").trim(); const sourceRevision = Number(formData.get("source_revision")); const revision = Number(formData.get("revision")); const reason = String(formData.get("reason") ?? "").trim();
  if (!UUID.test(id) || !Number.isSafeInteger(sourceRevision) || sourceRevision < 1 || !Number.isSafeInteger(revision) || revision < 1 || reason.length < 3 || reason.length > 2_000) fail("invalid_content");
  const { error } = await operator.supabase.rpc("site_restore_content_revision", { target_content: id, source_revision: sourceRevision, expected_revision: revision, action_reason: reason });
  if (error) fail(error.message.includes("reason") ? "reason_required" : "restore_failed");
  revalidatePath("/account"); revalidatePath("/", "layout"); redirect("/account?section=administration&admin_saved=1");
}
