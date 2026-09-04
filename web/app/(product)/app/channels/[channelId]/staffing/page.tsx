import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { setChannelStaffAction } from "@/app/(product)/actions";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelSubnav } from "@/components/product/channel-subnav";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Channel Staffing" };

export default async function ChannelStaffingPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { channelId } = await params;
  const { error: queryError, saved } = await searchParams;
  const { supabase } = await getWorkspaceContext();

  const [{ data: channel }, { data: agents }, { data: staffData }] = await Promise.all([
    supabase.from("channels").select("id, name, status").eq("id", channelId).maybeSingle(),
    supabase.from("agents").select("id, name, capability, model, lanes(id, name, departments(id, name))").order("name"),
    supabase.from("channel_staff").select("agent_id").eq("channel_id", channelId),
  ]);

  if (!channel) notFound();

  const assignedSet = new Set((staffData ?? []).map((row) => row.agent_id));
  const agentList = agents ?? [];

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, href: `/app/channels/${channel.id}` },
            { label: "Staffing", current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name} · Staffing
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status}
          </FlowbiteBadge>
        </div>
      </div>

      <ChannelSubnav channelId={channel.id} activeTab="staffing" />

      {queryError ? <p className="form-error mb-4" role="alert">Unable to update channel staff.</p> : null}
      {saved ? <p className="status-pill is-complete mb-4" role="status">Staffing assignment updated.</p> : null}

      <div className="mb-6 space-y-1">
        <h2 className="font-display text-xl font-semibold text-text">Assigned Agents</h2>
        <p className="font-body text-xs text-text-muted">
          Select which specialists operate on this channel. Assigned agents execute pipeline handoffs and generate media for this outlet.
        </p>
      </div>

      {agentList.length === 0 ? (
        <div className="panel empty-state">
          <h3>No agents in studio yet.</h3>
          <p>Hire agents from the catalog or build custom lanes to staff this channel.</p>
          <Link className="button button-primary" href="/app/agents">Browse agent catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentList.map((agent) => {
            const isAssigned = assignedSet.has(agent.id);
            const lane = agent.lanes as { name?: string; departments?: { name?: string } | null } | null;
            const deptName = lane?.departments?.name ?? "General";
            const laneName = lane?.name ?? "Unassigned lane";

            return (
              <PrelineCard
                key={agent.id}
                kicker={`${deptName} · ${laneName}`}
                title={agent.name}
                badge={
                  <FlowbiteBadge color={isAssigned ? "lime" : "cyan"} size="sm">
                    {isAssigned ? "Assigned" : "Available"}
                  </FlowbiteBadge>
                }
                subtitle={agent.capability ?? "Specialist"}
                footer={
                  <div className="flex w-full items-center justify-between">
                    <span className="font-mono text-[10px] text-text-faint">{agent.model ?? "default model"}</span>
                    <form action={setChannelStaffAction}>
                      <input type="hidden" name="channel_id" value={channel.id} />
                      <input type="hidden" name="agent_id" value={agent.id} />
                      <input type="hidden" name="assign" value={isAssigned ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`font-mono text-xs px-2.5 py-1 rounded-sm transition-colors ${
                          isAssigned
                            ? "border border-red/40 text-red hover:bg-red/10"
                            : "button button-primary text-xs"
                        }`}
                      >
                        {isAssigned ? "Remove" : "Assign to channel"}
                      </button>
                    </form>
                  </div>
                }
              >
                <p className="text-xs text-text-muted font-body">
                  Dedicated production specialist ready for {channel.name} workflows.
                </p>
              </PrelineCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
