import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProduction } from "@/app/(product)/actions";
import { CreateForm } from "@/components/product/create-form";
import Link from "next/link";

export default async function ChannelPage({ params, searchParams }: { params: Promise<{ channelId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { channelId } = await params;
  const supabase = await createClient();
  const { data: channel } = await supabase.from("channels").select("id, name, status").eq("id", channelId).single();
  if (!channel) notFound();
  const { data: productions } = await supabase.from("productions").select("id, title, status").eq("channel_id", channelId).order("created_at", { ascending: false });
  const paramsValue = await searchParams;
  return <section className="product-page shell"><Link className="text-link" href="/app/channels">← Channels</Link><p className="kicker">Channel / {channel.status}</p><h1>{channel.name}</h1>{paramsValue.error === "production" && <p className="form-error" role="alert">Unable to create that production.</p>}<form action={createProduction} className="inline-form"><input type="hidden" name="channel_id" value={channelId} /><label>New production<input name="title" placeholder="Episode 1 — Pilot" maxLength={120} required /></label><button className="button button-primary" type="submit">Create</button></form><div className="panel"><h2>Productions</h2>{productions?.length ? <div className="grid">{productions.map((production) => <Link className="card" href={`/app/productions/${production.id}`} key={production.id}><p className="kicker">{production.status}</p><h3>{production.title}</h3></Link>)}</div> : <p className="muted">No productions yet.</p>}</div></section>;
}
