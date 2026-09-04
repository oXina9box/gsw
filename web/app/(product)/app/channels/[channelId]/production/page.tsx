import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { FlowbiteProgress } from "@/components/blocks/flowbite/flowbite-progress";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Channel Production" };

export default async function ChannelProductionPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const { supabase } = await getWorkspaceContext();

  const [{ data: channel }, { data: productions }] = await Promise.all([
    supabase.from("channels").select("id, name, status").eq("id", channelId).maybeSingle(),
    supabase
      .from("productions")
      .select("id, title, status, current_step, step_count, run_mode, scheduled_at, updated_at, workflows(id, name)")
      .eq("channel_id", channelId)
      .order("updated_at", { ascending: false }),
  ]);

  if (!channel) notFound();

  const productionList = productions ?? [];

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Production", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Production Pipeline
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status}
          </FlowbiteBadge>
        </div>
        <Link className="button button-primary text-xs" href="/app/front-office">
          New production slate
        </Link>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="production" />

      <div className="rounded-md border border-border bg-surface p-5 mb-8 space-y-2">
        <h2 className="font-display text-lg font-semibold text-text">Node-Based Production Canvas</h2>
        <p className="font-body text-xs text-text-muted">
          Each production on {channel.name} executes through the 13-stage agent node canvas — routing briefs through Research, Story, Storyboard, Script, Screenplay, AI Conversion, Video Production, and Assemble. Open any active slate below to inspect the live node graph.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-text">Active Production Slates</h3>
          <span className="font-mono text-xs text-text-faint">{productionList.length} total</span>
        </div>

        {productionList.length === 0 ? (
          <div className="panel empty-state">
            <h3>No productions on this channel yet.</h3>
            <p>Launch your first episode or film through the Front Office brief builder.</p>
            <Link className="button button-primary" href="/app/front-office">Create first production</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productionList.map((prod) => {
              const current = prod.current_step ?? 1;
              const total = prod.step_count ?? 13;
              const progress = Math.round((current / total) * 100);
              const workflow = prod.workflows as { name?: string } | null;

              return (
                <PrelineCard
                  key={prod.id}
                  kicker={workflow?.name ?? "13-Stage Pipeline"}
                  title={prod.title}
                  badge={
                    <FlowbiteBadge color={prod.status === "active" ? "lime" : prod.status === "draft" ? "amber" : "cyan"} size="sm">
                      {prod.status}
                    </FlowbiteBadge>
                  }
                  subtitle={`Mode: ${prod.run_mode || "guided"} · Stage ${current} of ${total}`}
                  footer={
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-[10px] text-text-faint">
                        Updated {new Date(prod.updated_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/app/productions/${prod.id}`}
                        className="font-mono text-xs text-cyan hover:underline font-semibold"
                      >
                        Open node canvas →
                      </Link>
                    </div>
                  }
                >
                  <div className="space-y-1.5 py-1">
                    <div className="flex justify-between font-mono text-[11px] text-text-muted">
                      <span>Pipeline progress</span>
                      <span>{progress}%</span>
                    </div>
                    <FlowbiteProgress progress={progress} color="pink" />
                  </div>
                </PrelineCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
