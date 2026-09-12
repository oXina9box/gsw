import { StudioShell, type ChannelSummary } from "@/components/product/studio-shell";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import type { NotificationRecord } from "@/components/product/notification-bell";
import { getPublishedSiteContent } from "@/lib/site/content-server";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user, membership, workspaceId } = await getWorkspaceContext();
  const [{ data: onboarding }, { data: channelsData, error: channelsError }, { data: notificationsData }, siteTips] = await Promise.all([
    supabase.from("onboarding_profiles").select("studio_identity").eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("channels").select("id, name, status, is_brand").eq("workspace_id", workspaceId).order("is_brand", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("notifications").select("id, kind, body, href, read_at, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(10),
    getPublishedSiteContent("studio-sidebar", "member"),
  ]);

  let channels: ChannelSummary[] = (channelsData ?? []) as ChannelSummary[];
  if (channelsError) {
    const { data: fallback, error: fallbackError } = await supabase.from("channels").select("id, name, status").eq("workspace_id", workspaceId).order("created_at", { ascending: true });
    if (fallbackError) throw new Error("Studio navigation could not load. Please try again.");
    channels = (fallback ?? []) as ChannelSummary[];
  }

  const notifications: NotificationRecord[] = (notificationsData ?? []) as NotificationRecord[];

  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  const identity = (onboarding?.studio_identity ?? {}) as Record<string, unknown>;
  const studioLogoUrl = typeof identity.logoUrl === "string" && identity.logoUrl.trim() ? identity.logoUrl.trim() : null;

  return (
    <StudioShell
      studioName={studioName}
      studioLogoUrl={studioLogoUrl}
      userEmail={user.email ?? undefined}
      orchestrationEnabled
      channels={channels}
      notifications={notifications}
      siteTips={siteTips}
    >
      {children}
    </StudioShell>
  );
}
