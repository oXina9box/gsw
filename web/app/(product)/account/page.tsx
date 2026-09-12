import Link from "next/link";
import { DeleteAccountButton } from "@/components/auth/delete-account-button";
import { MfaSettings } from "@/components/auth/mfa-settings";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { renameStudio } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { getOperatorAccess, operatorAccessError } from "@/lib/studio/operator-access";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata = { title: "Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; scheduled?: string; cancelled?: string; saved?: string; section?: string; admin_error?: string; admin_saved?: string }>;
}) {
  const supabase = await createClient();
  const { workspaceName } = await getWorkspaceContext();
  const [{ data: { user } }, { data: deletion }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("account_deletion_requests").select("purge_after, cancelled_at").maybeSingle(),
  ]);
  const query = await searchParams;
  const operatorAccess = await getOperatorAccess();
  const administration = operatorAccess.ok && query.section === "administration" ? await Promise.all([
    supabase.from("site_content_items").select("*").order("updated_at", { ascending: false }).limit(50),
    supabase.from("site_content_revisions").select("content_id, revision, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("site_review_cases").select("id, target_kind, target_id, outcome, reason, created_at").order("created_at", { ascending: false }).limit(50),
  ]) : null;
  const administrationFailed = administration?.some((result) => result.error);
  const editorialItems = administration && !administrationFailed ? await Promise.all((administration[0].data ?? []).map(async (item) => {
    if (!item.media_path) return item;
    const { data, error } = await supabase.storage.from("site-editorial").createSignedUrl(item.media_path, 300);
    return { ...item, media_url: error ? null : data?.signedUrl ?? null };
  })) : [];
  const errorMessage =
    query.error === "reauth"
      ? "Password confirmation failed."
      : query.error === "studio"
      ? "Studio name could not be saved."
      : query.error === "cancel_late"
      ? "Deletion is already being processed and can no longer be cancelled."
      : "Account deletion could not be scheduled.";

  return (
    <section className="product-page shell" data-archetype="B3-A">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Security & data.
        </h1>
        <p className="text-base text-text-muted font-body">
          Identity, studio name, MFA, export, and deletion controls in one panel set.
        </p>
      </div>

      {query.error && <p className="form-error mb-6" role="alert">{errorMessage}</p>}
      {query.scheduled && <p className="form-note text-lime mb-6 font-mono text-xs" role="status">Deletion scheduled.</p>}
      {query.cancelled && <p className="form-note text-lime mb-6 font-mono text-xs" role="status">Deletion cancelled.</p>}
      {query.saved && <p className="form-note text-lime mb-6 font-mono text-xs" role="status">Studio name saved.</p>}
      {operatorAccess.ok && query.section !== "administration" && <Link className="button button-outline mb-4" href="/account?section=administration">Site administration</Link>}
      {query.section === "administration" && (!operatorAccess.ok ? (
        <PrelineCard kicker="Administration" title="Access required"><p className="form-error" role="alert">{operatorAccessError(operatorAccess.reason)}</p></PrelineCard>
      ) : administrationFailed ? (
        <p className="form-error" role="alert">Administration records could not load. Reload to retry.</p>
      ) : (
        <div className="mb-6">
          {query.admin_error && <p className="form-error mb-4" role="alert">Administration action could not be completed. Check the fields and reload before retrying.</p>}
          {query.admin_saved && <p className="form-note mb-4" role="status">Administration change saved.</p>}
          <AdminConsole items={editorialItems} revisions={administration?.[1].data ?? []} reviews={administration?.[2].data ?? []} />
        </div>
      ))}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <PrelineCard
            kicker="Studio Identity"
            title="Studio Profile"
            subtitle={`Signed in as ${user?.email}`}
          >
            <form action={renameStudio} className="stack-form">
              <label>
                Studio brand
                <input name="name" maxLength={120} defaultValue={workspaceName} required />
              </label>
              <button className="button button-primary" type="submit">
                Save studio name
              </button>
            </form>

            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">End current session</span>
              <SignOutButton />
            </div>
          </PrelineCard>

          <PrelineCard
            kicker="Two-Step Verification"
            title="MFA Security"
            subtitle="Protect your studio with hardware passkeys or authenticator apps"
          >
            <MfaSettings />
          </PrelineCard>
        </div>

        <div className="space-y-6">
          <PrelineCard
            kicker="Data Sovereignty"
            title="Account Export"
            subtitle="Download complete workspace archive (JSON)"
          >
            <p className="text-sm text-text-muted font-body">
              Export your channels, productions, DNA continuity bibles, and job ledger records.
            </p>
            <form action="/api/account/export" method="get" className="pt-2">
              <button className="button button-outline text-xs" type="submit">
                Export Studio Data (JSON) ↓
              </button>
            </form>
          </PrelineCard>

          <PrelineCard
            kicker="Danger Zone"
            title="Delete Studio Account"
            subtitle="Irreversible workspace and data removal"
            className="border-red/40"
          >
            <p className="text-sm text-text-muted font-body">
              Permanently purge all productions, DNA continuity profiles, and credential vaults.
            </p>
            <div className="pt-2">
              <DeleteAccountButton purgeAfter={deletion?.purge_after} />
            </div>
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
