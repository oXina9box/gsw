import { Suspense } from "react";
import { StudioShell } from "@/components/product/studio-shell";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { shouldRedirectToOnboarding, type OnboardingStep } from "@/lib/studio/onboarding";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user, membership } = await getWorkspaceContext();
  const { data: onboarding } = await supabase
    .from("onboarding_profiles")
    .select("mode, step, studio_identity, commercial_choice, provider_status, channel_setup, department_setup, lane_handoffs, missing_data_notes")
    .maybeSingle();
  const needsOnboarding = shouldRedirectToOnboarding(onboarding?.step);
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  const identity = (onboarding?.studio_identity ?? {}) as Record<string, unknown>;
  const studioLogoUrl = typeof identity.logoUrl === "string" && identity.logoUrl.trim() ? identity.logoUrl.trim() : null;
  return (
    <>
      <StudioShell studioName={studioName} studioLogoUrl={studioLogoUrl} userEmail={user.email ?? undefined} orchestrationEnabled>{children}</StudioShell>
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
