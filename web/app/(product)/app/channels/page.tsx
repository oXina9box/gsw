import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Channels" };

export default async function ChannelsPage() {
  const { supabase } = await getWorkspaceContext();
  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, name, status, audience, voice, cadence, pillars, productions(id, status)")
    .order("created_at", { ascending: false });

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="section-head mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            Recurring outlets.
          </h1>
          <p className="text-base text-text-muted font-body mt-1">
            Manage distribution channels, audience definitions, and content cadence.
          </p>
        </div>
        <Link className="button button-primary" href="/app/marketing">
          Create channel
        </Link>
      </div>

      {error ? (
        <p className="form-error" role="alert">Unable to load channels.</p>
      ) : channels?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => {
            const productions = Array.isArray(channel.productions) ? channel.productions : [];
            const active = productions.filter((p) => p.status === "active").length;

            return (
              <Link key={channel.id} href={`/app/channels/${channel.id}`} className="block group">
                <PrelineCard
                  kicker={`${productions.length} productions`}
                  title={channel.name}
                  badge={
                    <FlowbiteBadge color={channel.status === "active" ? "lime" : "amber"} size="sm">
                      {channel.status}
                    </FlowbiteBadge>
                  }
                  subtitle={channel.audience || "Audience not defined."}
                  footer={
                    <div className="w-full flex items-center justify-between">
                      <span>Active: {active}</span>
                      <span className="text-cyan group-hover:underline font-mono">View channel →</span>
                    </div>
                  }
                  className="h-full transition-all duration-150 group-hover:border-cyan"
                >
                  <dl className="grid gap-2 text-xs font-mono text-text-muted">
                    <div className="flex justify-between border-t border-border-2 pt-2">
                      <dt className="text-text-faint">Voice</dt>
                      <dd className="text-text">{channel.voice || "Open"}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border-2 pt-2">
                      <dt className="text-text-faint">Cadence</dt>
                      <dd className="text-text">{channel.cadence || "Open"}</dd>
                    </div>
                    {channel.pillars?.length ? (
                      <div className="flex justify-between border-t border-border-2 pt-2">
                        <dt className="text-text-faint">Pillars</dt>
                        <dd className="text-text truncate max-w-[12rem]">{channel.pillars.join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                </PrelineCard>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel empty-state">
          <h3>No channels yet.</h3>
          <p>Define your first recurring outlet to manage audience rules.</p>
          <Link className="button button-primary" href="/app/marketing">
            Create channel
          </Link>
        </div>
      )}
    </section>
  );
}
