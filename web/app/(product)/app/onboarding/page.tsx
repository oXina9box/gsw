import Link from "next/link";
import { OnboardingSections } from "@/components/onboarding/onboarding-sections";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Studio onboarding" };

const ERRORS: Readonly<Record<string, string>> = {
  identity: "Add a valid studio name, then save again.",
  commercial: "Choose a valid usage preference, then save again.",
  providers: "Provider credentials could not be saved. Check the key and try again.",
  channel: "Add a channel name, or leave this section for later.",
  hiring: "Select at least one department, then save again.",
  lane: "Review every workflow handoff before installing the baseline.",
  order: "That section is not available yet. Save the preceding section first.",
  save: "Setup could not be saved. Try again.",
};

export default async function OnboardingPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ section?: string; saved?: string; error?: string }>;
}>) {
  const { supabase, membership } = await getWorkspaceContext();
  const [{ data: profile, error: profileError }, params] = await Promise.all([
    supabase
      .from("onboarding_profiles")
      .select("step, studio_identity, commercial_choice, provider_status, channel_setup, department_setup, lane_handoffs")
      .maybeSingle(),
    searchParams,
  ]);
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "your studio";

  return (
    <section className="product-page shell onboarding-page" data-archetype="B3-B">
      <header className="grid gap-4 border-b border-border pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="kicker">Studio onboarding</p>
          <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">Studio setup for {studioName}, at your pace.</h1>
          <p className="lede mt-2">Explore the studio anytime. These six sections save separately, stay editable, and never block the rest of the product.</p>
        </div>
        <Link className="button button-outline" href="/app">Back to studio</Link>
      </header>

      <nav className="onboarding-rail" aria-label="Onboarding sections">
        {[
          ["identity", "Identity"],
          ["commercial", "Usage"],
          ["providers", "Providers"],
          ["channel", "Channel"],
          ["hiring", "Departments"],
          ["lane", "Workflow"],
        ].map(([id, label], index) => (
          <a className="onboarding-rail-step" href={`#${id}`} key={id}>{String(index + 1).padStart(2, "0")} {label}</a>
        ))}
      </nav>

      {profileError ? <p className="form-error" role="alert">Setup data could not load. Refresh to try again.</p> : null}
      {params.error ? <p className="form-error" role="alert">{ERRORS[params.error] ?? ERRORS.save}</p> : null}
      {params.saved ? <p className="status-pill is-complete justify-self-start" role="status">Section saved.</p> : null}

      <OnboardingSections profile={profile} activeSection={params.section} />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <p className="text-sm text-text-muted">Nothing here is permanent. Return whenever the studio changes.</p>
        <Link className="button button-primary active:scale-[0.96]" href="/app">Explore studio</Link>
      </footer>
    </section>
  );
}
