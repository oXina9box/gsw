import { StudioShell } from "@/components/product/studio-shell";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user, membership } = await getWorkspaceContext();
  const { data: onboarding } = await supabase
    .from("onboarding_profiles")
    .select("studio_identity")
    .maybeSingle();
  const { data: channels } = await supabase
    .from("channels")
    .select("id, name, status")
    .order("created_at", { ascending: true });
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  const identity = (onboarding?.studio_identity ?? {}) as Record<string, unknown>;
  const studioLogoUrl = typeof identity.logoUrl === "string" && identity.logoUrl.trim() ? identity.logoUrl.trim() : null;
  return <StudioShell studioName={studioName} studioLogoUrl={studioLogoUrl} userEmail={user.email ?? undefined} orchestrationEnabled channels={channels ?? []}>{children}</StudioShell>;
}
