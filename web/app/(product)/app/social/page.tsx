import { createSignal } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Social Workshop" };

export default async function SocialPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await getWorkspaceContext();
  const [{ data: signals }, { data: connections }, { data: publications }] = await Promise.all([
    supabase.from("signals").select("id, signal_type, title, body, status, created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("social_connections").select("id, platform, account_label, status").order("platform"),
    supabase.from("publications").select("id, status, scheduled_at, published_at, external_post_id, productions(title), social_connections(platform, account_label)").order("created_at", { ascending: false }).limit(20),
  ]);
  const { error } = await searchParams;
  return <section className="product-page shell">
    <h1>Release. Listen. Feed it back.</h1>
    <p className="lede">Plan releases and save manual audience signals as structured inputs for the next production. Direct posting and analytics sync are not enabled in this build.</p>
    {error ? <p className="form-error" role="alert">Signal could not be saved.</p> : null}
    <div className="platform-strip">{["youtube", "instagram", "facebook", "tiktok", "x"].map((platform) => { const connection = connections?.find((item) => item.platform === platform); return <div key={platform}><strong>{platform}</strong><span className={`status-mark ${connection?.status ?? "offline"}`}>{connection ? connection.account_label : "not connected"}</span></div>; })}</div>
    <div className="workspace-split"><section className="panel"><h2>Signal board</h2>{signals?.length ? <div className="signal-grid">{signals.map((signal) => <article className="signal-item" key={signal.id}><span className="channel-tag">{signal.signal_type}</span><h3>{signal.title}</h3><p>{signal.body}</p><small>{signal.status}</small></article>)}</div> : <div className="empty-state"><p>No signals yet. Add the first observation manually.</p></div>}<form action={createSignal} className="stack-form compact-form"><h3>Add a manual signal</h3><label>Type<select name="signal_type"><option value="recommendation">Recommendation</option><option value="conversation">Conversation</option><option value="performance">Performance</option><option value="native">Native cut</option></select></label><label>Target<select name="target_kind"><option value="channel">Channel</option><option value="production">Production</option><option value="market">Market</option></select></label><label>Title<input name="title" maxLength={120} required placeholder="Audience requests longer dialogue cuts" /></label><label>Observation body<textarea name="body" maxLength={2000} rows={4} required placeholder="Note exact comments, drop-off timestamps, and hook revisions." /></label><button className="button button-outline" type="submit">Save signal</button></form></section><section className="panel"><h2>Broadcast releases</h2>{publications?.length ? <div className="catalog-list">{publications.map((item) => { const production = Array.isArray(item.productions) ? item.productions[0] : (item.productions as { title?: string } | null); const connection = Array.isArray(item.social_connections) ? item.social_connections[0] : (item.social_connections as { platform?: string; account_label?: string } | null); return <article className="catalog-row" key={item.id}><div><strong>{connection?.platform ?? "Social"}</strong><p className="muted">{production?.title ?? "Studio release"} · {connection?.account_label ?? "Account"}</p></div><span className={`status-mark ${item.status}`}>{item.status}</span></article>; })}</div> : <p className="muted">No publications logged yet.</p>}</section></div>
  </section>;
}
