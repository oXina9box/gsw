import { DeleteAccountButton } from "@/components/auth/delete-account-button";
import { MfaSettings } from "@/components/auth/mfa-settings";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { renameStudio } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; scheduled?: string; cancelled?: string; saved?: string }> }) {
  const supabase = await createClient();
  const { workspaceName } = await getWorkspaceContext();
  const [{ data: { user } }, { data: deletion }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("account_deletion_requests").select("purge_after, cancelled_at").maybeSingle(),
  ]);
  const query = await searchParams;
  const errorMessage = query.error === "reauth" ? "Password confirmation failed." : query.error === "studio" ? "Studio name could not be saved." : query.error === "cancel_late" ? "Deletion is already being processed and can no longer be cancelled." : "Account deletion could not be scheduled.";
  return <section className="product-page shell"><h1>Security & data.</h1>{query.error ? <p className="form-error" role="alert">{errorMessage}</p> : null}{query.scheduled ? <p className="form-note" role="status">Deletion scheduled.</p> : null}{query.cancelled ? <p className="form-note" role="status">Deletion cancelled.</p> : null}{query.saved ? <p className="form-note" role="status">Studio name saved.</p> : null}<div className="workspace-split"><section className="panel"><p className="muted">Signed in as</p><h2>{user?.email}</h2><form action={renameStudio} className="stack-form"><label>Studio brand<input name="name" maxLength={120} defaultValue={workspaceName} required /></label><button className="button button-outline" type="submit">Rename Studio</button></form><div className="actions"><SignOutButton /><a className="button button-outline" href="/api/account/export">Export Studio data</a></div></section><section className="panel"><MfaSettings /></section></div><section className="panel danger-panel"><h2>Delete account</h2><p className="muted">Schedule the account and its solo workspace for permanent deletion. Export first. Password confirmation is required.</p><DeleteAccountButton purgeAfter={deletion && !deletion.cancelled_at ? deletion.purge_after : null} /></section></section>;
}
