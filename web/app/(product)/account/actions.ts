"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestAccountDeletion(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || password.length < 8) redirect("/account?error=reauth");
  const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (authError) redirect("/account?error=reauth");
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
    const code = String(formData.get("mfa_code") ?? "");
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp.find((item) => item.status === "verified");
    if (!factor || !/^\d{6}$/.test(code)) redirect("/account?error=reauth");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError) redirect("/account?error=reauth");
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code });
    if (verifyError) redirect("/account?error=reauth");
  }
  const { error } = await supabase.rpc("request_account_deletion");
  if (error) redirect("/account?error=deletion");
  revalidatePath("/account");
  redirect("/account?scheduled=1");
}

export async function cancelAccountDeletion() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cancel_account_deletion");
  if (error) redirect("/account?error=deletion");
  if (data !== true) redirect("/account?error=cancel_late");
  revalidatePath("/account");
  redirect("/account?cancelled=1");
}
