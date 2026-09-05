import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { ChannelMarketingClient } from "@/components/product/channel-marketing-client";

export const metadata = { title: "Channel Marketing & Pre-Production" };

export default async function ChannelMarketingPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { channelId } = await params;
  const { error: queryError, saved } = await searchParams;
  const { supabase } = await getWorkspaceContext();

  const [{ data: channel }, { data: budgetData }, { data: productions }] = await Promise.all([
    supabase
      .from("channels")
      .select("id, name, status, audience, voice, cadence, pillars")
      .eq("id", channelId)
      .maybeSingle(),
    supabase
      .from("channel_marketing_budgets")
      .select("guideline_credits, notes, updated_at")
      .eq("channel_id", channelId)
      .maybeSingle(),
    supabase
      .from("productions")
      .select("id, title, status, production_budget_guidelines(guideline_credits, notes)")
      .eq("channel_id", channelId),
  ]);

  if (!channel) notFound();

  const productionList = productions ?? [];
  const totalProductionCredits = productionList.reduce((acc, p) => {
    const bg = p.production_budget_guidelines as { guideline_credits?: number | null } | null;
    return acc + (bg?.guideline_credits ?? 0);
  }, 0);

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Marketing", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Pre-Production &amp; Marketing
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status ?? "active"}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="marketing" />

      {queryError ? (
        <p className="form-error mb-4" role="alert">
          Unable to save channel directives or budget.
        </p>
      ) : null}
      {saved ? (
        <p className="status-pill is-complete mb-4" role="status">
          Channel configuration saved.
        </p>
      ) : null}

      <ChannelMarketingClient
        channel={channel}
        budgetData={budgetData}
        productions={
          productionList as unknown as Parameters<typeof ChannelMarketingClient>[0]["productions"]
        }
        totalProductionCredits={totalProductionCredits}
      />
    </section>
  );
}
