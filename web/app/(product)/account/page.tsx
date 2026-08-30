import { DeleteAccountButton } from "@/components/auth/delete-account-button";
import { MfaSettings } from "@/components/auth/mfa-settings";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { renameStudio } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; scheduled?: string; cancelled?: string; saved?: string }>;
}) {
  const supabase = await createClient();
  const { workspaceName } = await getWorkspaceContext();
  const [{ data: { user } }, { data: deletion }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("account_deletion_requests").select("purge_after, cancelled_at").maybeSingle(),
  ]);
  const query = await searchParams;
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
            <form action="/api/account/export" method="post" className="pt-2">
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
