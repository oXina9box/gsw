import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelStaffingClient } from "@/components/product/channel-staffing-client";

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
  const { supabase, workspaceId } = await getWorkspaceContext();

  const [{ data: channel, error: channelError }, { data: agents, error: agentsError }, { data: staffData, error: staffError }] = await Promise.all([
    supabase.from("channels").select("id, name, status").eq("workspace_id", workspaceId).eq("id", channelId).maybeSingle(),
    supabase
      .from("agents")
      .select("id, name, capabilities, recommended_tier, model_tier_override, lanes(id, name, departments(id, name))")
      .eq("workspace_id", workspaceId)
      .order("name"),
    supabase.from("channel_staff").select("agent_id").eq("workspace_id", workspaceId).eq("channel_id", channelId),
  ]);
  const isStaffSchemaMissing = staffError?.code === "PGRST205";
  if (channelError || agentsError || (staffError && !isStaffSchemaMissing)) throw new Error("Channel staffing could not load. Please try again.");
  if (!channel) notFound();
  const assignedAgentIds = (staffData ?? []).map((row) => row.agent_id);

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
            {channel.status ?? "active"}
          </FlowbiteBadge>
        </div>
      </div>


      {queryError ? (
        <p className="form-error mb-4" role="alert">
          Unable to update channel staff.
        </p>
      ) : null}
      {saved ? (
        <p className="status-pill is-complete mb-4" role="status">
          Staffing assignment updated.
        </p>
      ) : null}

      <ChannelStaffingClient
        channelId={channel.id}
        channelName={channel.name}
        agents={
          (agents ?? []) as unknown as Parameters<typeof ChannelStaffingClient>[0]["agents"]
        }
        assignedAgentIds={assignedAgentIds}
      />
    </section>
  );
}
