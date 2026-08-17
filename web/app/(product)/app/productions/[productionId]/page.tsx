import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductionProgress } from "@/components/product/production-progress";
import { updateProductionStatus } from "@/app/(product)/actions";
import Link from "next/link";

export default async function ProductionPage({ params, searchParams }: { params: Promise<{ productionId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { productionId } = await params;
  const supabase = await createClient();
  const { data: production } = await supabase.from("productions").select("id, title, status, current_step, step_count, data, channel_id").eq("id", productionId).single();
  if (!production) notFound();
  const { data: events } = await supabase.from("production_events").select("id, event_type, from_step, to_step, created_at").eq("production_id", productionId).order("created_at", { ascending: false }).limit(10);
  const paramsValue = await searchParams;
  const currentStep = production.current_step ?? 0;
  const stepCount = production.step_count ?? 13;
  return <section className="product-page shell"><Link className="text-link" href={`/app/channels/${production.channel_id}`}>← Channel</Link><p className="kicker">Production / {production.status}</p><h1>{production.title}</h1>{paramsValue.error === "production" && <p className="form-error" role="alert">Unable to save this production.</p>}<div className="panel"><div className="section-head"><div><h2>Production workflow</h2><p className="muted">Stage {Math.min(currentStep + 1, stepCount)} of {stepCount}</p></div><form action={updateProductionStatus} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><label>Status<select name="status" defaultValue={production.status}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="shipped">Shipped</option><option value="archived">Archived</option></select></label><button className="button button-outline" type="submit">Save status</button></form></div><ProductionProgress productionId={production.id} currentStep={currentStep} stepCount={stepCount} /></div><div className="panel"><h2>Recent events</h2>{events?.length ? <ul className="event-list">{events.map((event) => <li key={event.id}><strong>{event.event_type}</strong><span>{event.from_step} → {event.to_step}</span><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></li>)}</ul> : <p className="muted">No events yet.</p>}</div></section>;
}
