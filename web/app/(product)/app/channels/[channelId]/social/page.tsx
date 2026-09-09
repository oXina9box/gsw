import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSocialClient } from "@/components/product/channel-social-client";

export const metadata = { title: "Channel Social Media & Two-Way Engagement" };

export default async function ChannelSocialPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();

  const [{ data: channel }, { data: connections }, { data: signals }, { data: productions }] =
    await Promise.all([
      supabase
        .from("channels")
        .select("id, name, status")
        .eq("workspace_id", workspaceId)
        .eq("id", channelId)
        .maybeSingle(),
      supabase
        .from("social_connections")
        .select("id, platform, account_label, status")
        .eq("workspace_id", workspaceId)
        .order("platform"),
      supabase
        .from("signals")
        .select("id, signal_type, title, body, status, created_at")
        .eq("workspace_id", workspaceId)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("productions")
        .select("id, title, release_packages(id, platform, caption, status, created_at)")
        .eq("workspace_id", workspaceId)
        .eq("channel_id", channelId),
    ]);

  if (!channel) notFound();

  const socialList = connections ?? [];
  const signalList = signals ?? [];
  const releasePackages = (productions ?? []).flatMap((p) => {
    const pkgs = Array.isArray(p.release_packages) ? p.release_packages : [];
    return pkgs.map((pkg) => ({
      id: pkg.id,
      platform: pkg.platform,
      caption: pkg.caption,
      status: pkg.status,
      created_at: pkg.created_at,
      productionTitle: p.title,
    }));
  });

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Social Media", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Social Media
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status ?? "active"}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSocialClient
        channelId={channel.id}
        channelName={channel.name}
        connections={socialList}
        signals={signalList}
        releasePackages={releasePackages}
      />
    </section>
  );
}
