import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Channels" };

export default async function ChannelsPage() {
  const { supabase } = await getWorkspaceContext();
  const { data: channels, error } = await supabase.from("channels").select("id, name, status, audience, voice, cadence, pillars, productions(id, status)").order("created_at", { ascending: false });
  return <section className="product-page shell"><div className="section-head"><div><h1>Recurring outlets.</h1></div><Link className="button button-primary" href="/app/marketing">Create channel</Link></div>
    {error ? <p className="form-error" role="alert">Unable to load channels.</p> : channels?.length ? <div className="grid channel-grid">{channels.map((channel) => { const productions = Array.isArray(channel.productions) ? channel.productions : []; const active = productions.filter((production) => production.status === "active").length; return <Link className="card channel-card" href={`/app/channels/${channel.id}`} key={channel.id}><span className="channel-tag">{channel.status} · {productions.length} productions</span><h2>{channel.name}</h2><p>{channel.audience || "Audience not defined."}</p><dl><div><dt>Voice</dt><dd>{channel.voice || "Open"}</dd></div><div><dt>Cadence</dt><dd>{channel.cadence || "Open"}</dd></div><div><dt>Active</dt><dd>{active}</dd></div></dl></Link>; })}</div> : <div className="panel empty-state"><h2>No channels yet.</h2><p>A channel is a recurring outlet or series under your Studio brand.</p><Link className="button button-primary" href="/app/marketing">Create the first channel</Link></div>}
  </section>;
}
