import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { DEPARTMENTS } from "@/lib/studio/domain";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const { supabase } = await getWorkspaceContext();
  const [{ data: channel }, { data: productions }] = await Promise.all([
    supabase.from("channels").select("id, name, status, audience, voice, cadence, pillars").eq("id", channelId).maybeSingle(),
    supabase.from("productions").select("id, title, status, current_step, step_count, run_mode, scheduled_at, updated_at").eq("channel_id", channelId).order("updated_at", { ascending: false }),
  ]);
  if (!channel) notFound();
  return <section className="product-page shell"><Link className="text-link" href="/app/channels">← Channels</Link><div className="section-head"><div><span className="channel-tag">{channel.status}</span><h1>{channel.name}</h1></div><Link className="button button-primary" href="/app/front-office">Open production</Link></div>
    <section className="strategy-panel"><div><span>Audience</span><p>{channel.audience || "Not defined"}</p></div><div><span>Voice</span><p>{channel.voice || "Not defined"}</p></div><div><span>Cadence</span><p>{channel.cadence || "Not defined"}</p></div><div><span>Pillars</span><p>{channel.pillars?.length ? channel.pillars.join(" · ") : "Not defined"}</p></div></section>
    <section className="panel"><div className="section-head"><h2>Productions</h2><span className="muted">{productions?.length ?? 0} total</span></div>{productions?.length ? <div className="production-list">{productions.map((production) => { const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1); return <Link className="production-row" href={`/app/productions/${production.id}`} key={production.id}><div><span className="channel-tag">{production.run_mode} · {production.status}</span><h3>{production.title}</h3></div><div className="mini-progress"><span>{DEPARTMENTS[current]}</span><progress className="progress-bar" max={production.step_count || 13} value={current + 1} /></div><time dateTime={production.updated_at}>{new Date(production.updated_at).toLocaleDateString()}</time></Link>; })}</div> : <div className="empty-state"><p>No productions yet.</p><Link className="button button-outline" href="/app/front-office">Bring a brief</Link></div>}</section>
  </section>;
}
