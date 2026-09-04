import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Channel Assets & DNA" };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

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
      .select("id, title, production_dna(id, role, dna_records(id, dna_id, dna_type, record, locked)), generated_assets(id, kind, uri, metadata, created_at)")
      .eq("channel_id", channelId),
  ]);

  if (!channel) notFound();

  const prodList = productions ?? [];
  const dnaItems = prodList.flatMap((p) => {
    const dnaList = Array.isArray(p.production_dna) ? p.production_dna : [];
    return dnaList.map((d) => ({ ...d, productionTitle: p.title }));
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
            {channel.status}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="assets" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="font-mono text-xs uppercase text-text-faint">Storage Used</span>
          <p className="mt-1 font-display text-2xl font-bold text-text">{formatBytes(bytesUsed)}</p>
          <span className="font-mono text-[10px] text-text-muted">Workspace vault</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="font-mono text-xs uppercase text-text-faint">Active DNA Records</span>
          <p className="mt-1 font-display text-2xl font-bold text-pink">{dnaItems.length}</p>
          <span className="font-mono text-[10px] text-text-muted">Continuity profiles locked</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="font-mono text-xs uppercase text-text-faint">Generated Assets</span>
          <p className="mt-1 font-display text-2xl font-bold text-cyan">{assetItems.length}</p>
          <span className="font-mono text-[10px] text-text-muted">Media takes &amp; binders</span>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Channel DNA Continuity</h2>
          <p className="font-body text-xs text-text-muted">
            Characters, locations, and props attached to {channel.name} productions to enforce visual continuity.
          </p>

          {dnaItems.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center">
              <p className="font-mono text-xs text-text-faint">No DNA records attached to productions on this channel yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dnaItems.map((item) => {
                const rec = item.dna_records as { dna_id?: string; dna_type?: string; record?: Record<string, unknown>; locked?: boolean } | null;
                const recName = typeof rec?.record?.name === "string" ? rec.record.name : (rec?.dna_id ?? "DNA Record");
                const recSummary = typeof rec?.record?.summary === "string" ? rec.record.summary : "Continuity anchor";

                return (
                  <PrelineCard
                    key={item.id}
                    kicker={`${rec?.dna_type ?? "DNA"} · ${item.role}`}
                    title={recName}
                    badge={
                      <FlowbiteBadge color={rec?.locked ? "pink" : "cyan"} size="sm">
                        {rec?.locked ? "Locked" : "Draft"}
                      </FlowbiteBadge>
                    }
                    subtitle={recSummary}
                    footer={
                      <span className="font-mono text-[10px] text-text-faint">
                        Used in {item.productionTitle}
                      </span>
                    }
                  >
                    <p className="text-xs text-text-muted font-body">
                      Continuity profile locked for this channel production.
                    </p>
                  </PrelineCard>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Generated Media Archive</h2>
          <p className="font-body text-xs text-text-muted">
            Output takes, image renders, audio tracks, and assembled cuts produced on this channel.
          </p>

          {assetItems.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center">
              <p className="font-mono text-xs text-text-faint">No generated assets on this channel yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {assetItems.map((asset) => (
                <div key={asset.id} className="rounded-md border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-pink font-semibold">{asset.kind}</span>
                    <span className="font-mono text-[10px] text-text-faint">{new Date(asset.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-mono text-xs text-text truncate">{asset.productionTitle}</p>
                  <p className="font-mono text-[10px] text-text-faint truncate">{asset.uri}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
