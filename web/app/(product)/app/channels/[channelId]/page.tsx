import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { ChannelDashboardClient } from "@/components/product/channel-dashboard-client";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { channelId } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();
  const [{ data: channel, error: channelError }, { data: productions, error: productionsError }] = await Promise.all([
    supabase
      .from("channels")
      .select("id, name, status, audience, voice, cadence, pillars")
      .eq("workspace_id", workspaceId)
      .eq("id", channelId)
      .maybeSingle(),
    supabase
      .from("productions")
      .select("id, title, status, current_step, step_count, run_mode, scheduled_at, updated_at")
      .eq("workspace_id", workspaceId)
      .eq("channel_id", channelId)
      .order("updated_at", { ascending: false }),
  ]);
  const { error } = await searchParams;
  if (channelError || productionsError) throw new Error("Channel data could not load. Please try again.");
  if (!channel) notFound();

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-3">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, current: true },
          ]}
        />
      </div>

      <div className="section-head mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-text">
            {channel.name} · Dashboard
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status ?? "Status unavailable"}
          </FlowbiteBadge>
        </div>
        <Link
          className="button button-primary"
          href={`/app/channels/${channel.id}/production`}
        >
          Open production
        </Link>
      </div>

      {error === "channel" ? (
        <p className="form-error mb-6" role="alert">
          The channel could not be saved.
        </p>
      ) : null}

      <ChannelDashboardClient
        channel={channel}
        productions={productions ?? []}
      />
    </section>
  );
}
