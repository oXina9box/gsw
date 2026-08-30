import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { updateChannel } from "@/app/(product)/actions";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { FlowbiteProgress } from "@/components/blocks/flowbite/flowbite-progress";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export default async function ChannelPage({
  params,
  searchParams,
}: {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { channelId } = await params;
  const { supabase } = await getWorkspaceContext();
  const [{ data: channel }, { data: productions }] = await Promise.all([
    supabase.from("channels").select("id, name, status, audience, voice, cadence, pillars").eq("id", channelId).maybeSingle(),
    supabase.from("productions").select("id, title, status, current_step, step_count, run_mode, scheduled_at, updated_at").eq("channel_id", channelId).order("updated_at", { ascending: false }),
  ]);
  const { error } = await searchParams;
  if (!channel) notFound();

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-6">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channels", href: "/app/channels" },
            { label: channel.name, current: true },
          ]}
        />
      </div>

      <div className="section-head mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {channel.name}
          </h1>
          <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"}>
            {channel.status}
          </FlowbiteBadge>
        </div>
        <Link className="button button-primary" href="/app/front-office">
          Open production
        </Link>
      </div>

      {error === "channel" ? (
        <p className="form-error mb-6" role="alert">The channel could not be saved.</p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-border bg-surface rounded-md mb-8">
        <div className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
          <span className="font-mono text-xs text-pink uppercase font-semibold">Audience</span>
          <p className="text-sm font-body text-text">{channel.audience || "Not defined"}</p>
        </div>
        <div className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
          <span className="font-mono text-xs text-pink uppercase font-semibold">Voice</span>
          <p className="text-sm font-body text-text">{channel.voice || "Not defined"}</p>
        </div>
        <div className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
          <span className="font-mono text-xs text-pink uppercase font-semibold">Cadence</span>
          <p className="text-sm font-body text-text">{channel.cadence || "Not defined"}</p>
        </div>
        <div className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
          <span className="font-mono text-xs text-pink uppercase font-semibold">Pillars</span>
          <p className="text-sm font-body text-text">{channel.pillars?.length ? channel.pillars.join(" · ") : "Not defined"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <PrelineCard
            kicker="Channel Settings"
            title="Edit channel"
            subtitle="Update distribution directives"
          >
            <form action={updateChannel} className="stack-form">
              <input type="hidden" name="channel_id" value={channel.id} />
              <label>
                Name
                <input name="name" maxLength={120} defaultValue={channel.name} required />
              </label>
              <label>
                Audience
                <input name="audience" maxLength={500} defaultValue={channel.audience ?? ""} />
              </label>
              <label>
                Voice
                <input name="voice" maxLength={500} defaultValue={channel.voice ?? ""} />
              </label>
              <label>
                Cadence
                <input name="cadence" maxLength={120} defaultValue={channel.cadence ?? ""} />
              </label>
              <label>
                Pillars (comma-separated)
                <input name="pillars" maxLength={500} defaultValue={channel.pillars?.join(", ") ?? ""} />
              </label>
              <button className="button button-primary" type="submit">
                Save channel
              </button>
            </form>
          </PrelineCard>
        </div>

        <div className="lg:col-span-7">
          <PrelineCard
            kicker="Production History"
            title="Productions"
            subtitle={`${productions?.length ?? 0} total productions`}
          >
            {productions?.length ? (
              <div className="divide-y divide-border-2">
                {productions.map((production) => {
                  const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1);
                  const progressPct = Math.round(((current + 1) / (production.step_count || 13)) * 100);

                  return (
                    <Link
                      className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-surface-2 p-2 rounded-sm transition-colors duration-150"
                      href={`/app/productions/${production.id}`}
                      key={production.id}
                    >
                      <div className="space-y-1">
                        <span className="font-mono text-xs text-text-faint">
                          {production.run_mode} · {production.status}
                        </span>
                        <h4 className="font-display text-base font-semibold text-text">
                          {production.title}
                        </h4>
                      </div>
                      <div className="w-full sm:w-44">
                        <FlowbiteProgress
                          progress={progressPct}
                          label={DEPARTMENTS[current]}
                          size="sm"
                          color="cyan"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-muted text-sm font-body">No productions under this channel yet.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
