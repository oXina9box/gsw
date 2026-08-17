import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProductionPage({ params }: { params: Promise<{ productionId: string }> }) {
  const { productionId } = await params;
  const supabase = await createClient();
  const { data: production } = await supabase.from("productions").select("id, title, status, data, channel_id").eq("id", productionId).single();
  if (!production) notFound();
  return <section className="product-page shell"><Link className="text-link" href={`/app/channels/${production.channel_id}`}>← Channel</Link><p className="kicker">Production / {production.status}</p><h1>{production.title}</h1><div className="panel"><h2>Production workspace</h2><p className="muted">This protected route is connected to the future Supabase production record. Workflow stages, DNA, GenPlay, and generated assets are added in the next migration slice.</p></div></section>;
}
