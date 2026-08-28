import { redirect } from "next/navigation";
import { StudioNav } from "@/components/product/studio-nav";
import { SiteFooter } from "@/components/shell/site-footer";
import { CoreB } from "@/components/templates/core-shell";
import { shouldRedirectToOnboarding } from "@/lib/studio/onboarding";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, membership } = await getWorkspaceContext();
  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_profiles")
    .select("step")
    .maybeSingle();
  if (!onboardingError && shouldRedirectToOnboarding(onboarding?.step)) redirect("/app/onboarding");
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  return <><StudioNav studioName={studioName} orchestrationEnabled /><main id="main-content"><CoreB>{children}</CoreB></main><SiteFooter /></>;
}
