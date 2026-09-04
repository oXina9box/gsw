import { StudioShell, type ChannelSummary } from "@/components/product/studio-shell";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import type { NotificationRecord } from "@/components/product/notification-bell";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user, membership } = await getWorkspaceContext();
  const [{ data: onboarding }, { data: channelsData, error: channelsError }, { data: notificationsData }] = await Promise.all([
    supabase.from("onboarding_profiles").select("studio_identity").maybeSingle(),
    supabase.from("channels").select("id, name, status, is_brand").order("is_brand", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("notifications").select("id, kind, body, href, read_at, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  let channels: ChannelSummary[] = (channelsData ?? []) as ChannelSummary[];
  if (channelsError) {
    const { data: fallback } = await supabase.from("channels").select("id, name, status").order("created_at", { ascending: true });
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
    >
      {children}
    </StudioShell>
  );
}
