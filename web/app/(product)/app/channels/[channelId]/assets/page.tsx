import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { ChannelAssetsClient } from "@/components/product/channel-assets-client";

export const metadata = { title: "Channel Assets & DNA Continuity" };

export default async function ChannelAssetsPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const { supabase } = await getWorkspaceContext();

  const [{ data: channel }, { data: storage }, { data: productions }] = await Promise.all([
    supabase.from("channels").select("id, name, status").eq("id", channelId).maybeSingle(),
    supabase.from("workspace_storage_usage").select("bytes_used").maybeSingle(),
    supabase
      .from("productions")
      .select(
        "id, title, production_dna(id, role, dna_records(id, dna_id, dna_type, record, locked)), generated_assets(id, kind, uri, metadata, created_at)"
      )
      .eq("channel_id", channelId),
  ]);

  if (!channel) notFound();

  const prodList = productions ?? [];
  const dnaItems = prodList.flatMap((p) => {
    const dnaList = Array.isArray(p.production_dna) ? p.production_dna : [];
    return dnaList.map((d) => ({
      ...d,
      productionTitle: p.title,
      dna_records: Array.isArray(d.dna_records) ? d.dna_records[0] : d.dna_records,
    }));
  });

  const assetItems = prodList.flatMap((p) => {
    const assets = Array.isArray(p.generated_assets) ? p.generated_assets : [];
    return assets.map((a) => ({ ...a, productionTitle: p.title }));
  });

  const bytesUsed = storage?.bytes_used ?? 0;

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Assets & DNA", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Assets &amp; DNA
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status ?? "active"}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="assets" />

      <ChannelAssetsClient
        channelId={channel.id}
        channelName={channel.name}
        bytesUsed={bytesUsed}
        dnaItems={
          dnaItems as unknown as Parameters<typeof ChannelAssetsClient>[0]["dnaItems"]
        }
        assetItems={
          assetItems as unknown as Parameters<typeof ChannelAssetsClient>[0]["assetItems"]
        }
      />
    </section>
  );
}
