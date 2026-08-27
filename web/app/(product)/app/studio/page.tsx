import Link from "next/link";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Studio" };

export default async function StudioPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ data: productions, error: productionsError }, { data: jobs, error: jobsError }] = await Promise.all([
    supabase.from("productions").select("id, title, status, current_step, step_count, run_mode, scheduled_at, channels(name)").in("status", ["draft", "active", "paused"]).order("scheduled_at", { ascending: true, nullsFirst: false }).limit(12),
    supabase.from("job_queue").select("id, kind, status, productions(title)").in("status", ["pending", "running", "failed"]).order("created_at", { ascending: false }).limit(8),
  ]);

  return <section className="product-page shell" data-archetype="B2-A">
    <div className="section-head"><div><h1>Production floor.</h1><p className="lede">Upcoming releases, open productions, and agent work in motion.</p></div><Link className="button button-primary" href="/app/front-office">Open production</Link></div>
    <section className="studio-section"><div className="section-head"><h2>Open productions</h2><span className="muted">{productionsError ? "Status unavailable" : `${productions?.length ?? 0} open`}</span></div>
      {productionsError ? <p className="form-error" role="alert">Unable to load open productions.</p> : productions?.length ? <div className="production-list">{productions.map((production) => { const channel = production.channels as { name?: string } | null; const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1); return <Link className="production-row" href={`/app/productions/${production.id}`} key={production.id}><div><span className="channel-tag">{channel?.name ?? "Channel"} · {production.run_mode}</span><h3>{production.title}</h3><small className="muted">{production.scheduled_at ? <time dateTime={production.scheduled_at}>Release {new Date(production.scheduled_at).toLocaleDateString()}</time> : "Release date open"}</small></div><div className="mini-progress"><span>{DEPARTMENTS[current]}</span><progress className="progress-bar" max={production.step_count || 13} value={current + 1} /></div><span className={`status-mark ${production.status}`}>{production.status}</span></Link>; })}</div> : <div className="panel empty-state"><h2>No open productions.</h2><p>Bring a brief when ready.</p></div>}
    </section>
    <section className="panel studio-section"><div className="section-head"><h2>Workflow status</h2><Link href="/app/orchestration">Orchestration</Link></div>{jobsError ? <p className="form-error" role="alert">Unable to load workflow status.</p> : jobs?.length ? <ul className="event-list">{jobs.map((job) => { const production = job.productions as { title?: string } | null; return <li key={job.id}><strong>{job.kind.replaceAll("_", " ")}</strong><span>{production?.title ?? "Studio task"}</span><span className={`status-mark ${job.status}`}>{job.status}</span></li>; })}</ul> : <p className="muted">No queued work.</p>}</section>
  </section>;
}
