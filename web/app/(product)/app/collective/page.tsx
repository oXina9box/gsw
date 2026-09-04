import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineStatsGrid, type PrelineStat } from "@/components/blocks/preline/preline-stats-grid";

export const metadata = { title: "Studio Reports" };

export default async function CollectivePage() {
  const { supabase } = await getWorkspaceContext();
  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, name, status, productions(id, status)")
    .order("created_at", { ascending: true });

  const list = error ? [] : (channels ?? []);
  const productions = list.flatMap((channel) => (Array.isArray(channel.productions) ? channel.productions : []));
  const activeChannels = list.filter((channel) => channel.status === "active").length;
  const activeProductions = productions.filter((production) => production.status === "active").length;

  const stats: PrelineStat[] = [
    { label: "Channels", value: String(list.length), subtext: `${activeChannels} active` },
    { label: "Productions", value: String(productions.length), subtext: `${activeProductions} active` },
  ];

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Studio Reports
        </h1>
        <p className="text-base text-text-muted font-body">
          Every number for this studio in one place — the brand channel and every channel roll up here.
        </p>
      </div>

      {error ? (
        <p className="form-error" role="alert">Unable to load studio reports.</p>
      ) : (
        <>
          <PrelineStatsGrid stats={stats} />
          {list.length === 0 ? (
            <div className="panel empty-state mt-8">
              <h3>No channels yet.</h3>
              <p>Once channels exist, their stats roll up into Studio Reports.</p>
              <Link className="button button-primary" href="/app/channels">Open channels</Link>
            </div>
          ) : (
            <ul className="catalog-list mt-8">
              {list.map((channel) => {
                const channelProductions = Array.isArray(channel.productions) ? channel.productions : [];
                return (
                  <li key={channel.id} className="catalog-row">
                    <div>
                      <h2>{channel.name}</h2>
                      <p className="muted">{channelProductions.length} productions · status {channel.status}</p>
                    </div>
                    <div className="catalog-action">
                      <Link className="button button-outline" href={`/app/channels/${channel.id}`}>View channel</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
