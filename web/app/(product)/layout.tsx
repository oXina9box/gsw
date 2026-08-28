import { Suspense } from "react";
import { StudioNav } from "@/components/product/studio-nav";
import { SiteFooter } from "@/components/shell/site-footer";
import { CoreB } from "@/components/templates/core-shell";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { shouldRedirectToOnboarding, type OnboardingStep } from "@/lib/studio/onboarding";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, membership } = await getWorkspaceContext();
  const { data: onboarding } = await supabase
    .from("onboarding_profiles")
    .select("mode, step, studio_identity, commercial_choice, provider_status, channel_setup, department_setup, lane_handoffs, missing_data_notes")
    .maybeSingle();
  const needsOnboarding = shouldRedirectToOnboarding(onboarding?.step);
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  return (
    <>
      <StudioNav studioName={studioName} orchestrationEnabled />
      <main id="main-content"><CoreB>{children}</CoreB></main>
      <SiteFooter />
      <Suspense fallback={null}>
        <OnboardingModal
          defaultOpen={needsOnboarding}
          initialStep={onboarding?.step as OnboardingStep | null}
          initialProfile={onboarding}
        />
      </Suspense>
    </>
  );
}
