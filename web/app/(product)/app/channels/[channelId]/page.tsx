import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const supabase = await createClient();
  const { data: channel } = await supabase.from("channels").select("id, name, status").eq("id", channelId).single();
  if (!channel) notFound();
  const { data: productions } = await supabase.from("productions").select("id, title, status").eq("channel_id", channelId).order("created_at", { ascending: false });
  return <section className="product-page shell"><Link className="text-link" href="/app/channels">← Channels</Link><p className="kicker">Channel / {channel.status}</p><h1>{channel.name}</h1><div className="panel"><h2>Productions</h2>{productions?.length ? <div className="grid">{productions.map((production) => <Link className="card" href={`/app/productions/${production.id}`} key={production.id}><p className="kicker">{production.status}</p><h3>{production.title}</h3></Link>)}</div> : <p className="muted">No productions yet.</p>}</div></section>;
}
