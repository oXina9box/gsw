import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { saveChannelMarketingBudget } from "@/app/(product)/actions";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";

export const metadata = { title: "Channel Marketing & Budget" };

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
    supabase.from("channels").select("id, name, status, audience, voice, cadence, pillars").eq("id", channelId).maybeSingle(),
    supabase.from("channel_marketing_budgets").select("guideline_credits, notes, updated_at").eq("channel_id", channelId).maybeSingle(),
    supabase.from("productions").select("id, title, status, production_budget_guidelines(guideline_credits, notes)").eq("channel_id", channelId),
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
            {channel.name} · Marketing &amp; Budget
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="marketing" />

      {queryError ? <p className="form-error mb-4" role="alert">Unable to save channel budget.</p> : null}
      {saved ? <p className="status-pill is-complete mb-4" role="status">Channel marketing budget saved.</p> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start mb-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h2 className="font-display text-xl font-semibold text-text">Channel Marketing Budget</h2>
            <p className="font-body text-xs text-text-muted">
              Allocate credit ceilings and strategic marketing guidelines for {channel.name}.
            </p>

            <form action={saveChannelMarketingBudget} className="stack-form space-y-4">
              <input type="hidden" name="channel_id" value={channel.id} />
              <div>
                <label htmlFor="guideline_credits" className="block font-mono text-xs text-text-faint uppercase">
                  Marketing Credit Guideline
                </label>
                <input
                  id="guideline_credits"
                  type="number"
                  name="guideline_credits"
                  min="0"
                  defaultValue={budgetData?.guideline_credits ?? 0}
                  className="mt-1 w-full rounded-sm border border-border-2 bg-surface-2 px-3 py-2 font-mono text-sm text-text"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block font-mono text-xs text-text-faint uppercase">
                  Marketing &amp; Campaign Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  maxLength={2000}
                  defaultValue={budgetData?.notes ?? ""}
                  placeholder="Target audience segments, promotional angles, paid acquisition experiments..."
                  className="mt-1 w-full rounded-sm border border-border-2 bg-surface-2 px-3 py-2 font-mono text-xs text-text"
                />
              </div>

              <button type="submit" className="button button-primary text-xs">
                Save channel budget
              </button>
            </form>
          </div>

          <div className="rounded-md border border-border bg-surface p-5 space-y-3">
            <h3 className="font-display text-lg font-semibold text-text">Production Budget Allocations</h3>
            <p className="font-body text-xs text-text-muted">
              Credits allocated across {productionList.length} productions on this channel (total: {totalProductionCredits} credits).
            </p>
            {productionList.length === 0 ? (
              <p className="font-mono text-xs text-text-faint">No productions on this channel yet.</p>
            ) : (
              <ul className="divide-y divide-border-2 font-mono text-xs">
                {productionList.map((p) => {
                  const bg = p.production_budget_guidelines as { guideline_credits?: number | null; notes?: string } | null;
                  return (
                    <li key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-text font-medium">{p.title}</span>
                        {bg?.notes ? <p className="text-[11px] text-text-faint">{bg.notes}</p> : null}
                      </div>
                      <span className="text-pink font-semibold">{bg?.guideline_credits ?? 0} credits</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-md border border-border bg-surface p-5 space-y-3">
            <h3 className="font-display text-lg font-semibold text-text">Distribution Strategy</h3>
            <dl className="grid gap-3 text-xs font-mono">
              <div className="border-b border-border-2 pb-2">
                <dt className="text-text-faint uppercase text-[10px]">Audience Target</dt>
                <dd className="text-text font-body text-sm mt-0.5">{channel.audience || "Open audience"}</dd>
              </div>
              <div className="border-b border-border-2 pb-2">
                <dt className="text-text-faint uppercase text-[10px]">Voice &amp; Tone</dt>
                <dd className="text-text font-body text-sm mt-0.5">{channel.voice || "Consistent studio tone"}</dd>
              </div>
              <div className="border-b border-border-2 pb-2">
                <dt className="text-text-faint uppercase text-[10px]">Release Cadence</dt>
                <dd className="text-text font-body text-sm mt-0.5">{channel.cadence || "Periodic"}</dd>
              </div>
              <div>
                <dt className="text-text-faint uppercase text-[10px]">Content Pillars</dt>
                <dd className="text-text font-body text-sm mt-0.5">
                  {channel.pillars?.length ? channel.pillars.join(" · ") : "Not defined"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
