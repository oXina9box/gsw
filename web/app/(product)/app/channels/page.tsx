import Link from "next/link";
import { createChannel } from "@/app/(product)/actions";
import { createClient } from "@/lib/supabase/server";
import { CreateForm } from "@/components/product/create-form";

export const metadata = { title: "Channels" };

export default async function ChannelsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: channels, error } = await supabase.from("channels").select("id, name, status").order("created_at", { ascending: false });
  const params = await searchParams;
  return <section className="product-page shell"><p className="kicker">Workspace / channels</p><h1>Channels</h1>{(error || params.error === "channel") && <p className="form-error" role="alert">Unable to save or load channels.</p>}<CreateForm action={createChannel} label="New channel" field="name" placeholder="Sci-fi shorts" />{channels?.length ? <div className="grid">{channels.map((channel) => <Link className="card" href={`/app/channels/${channel.id}`} key={channel.id}><p className="kicker">{channel.status}</p><h2>{channel.name}</h2></Link>)}</div> : <div className="panel"><h2>No channels yet.</h2><p className="muted">Create the first channel for this workspace.</p></div>}</section>;
}
