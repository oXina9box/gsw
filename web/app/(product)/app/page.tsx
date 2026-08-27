import Link from "next/link";
import { redirect } from "next/navigation";
import { DataSummary } from "@/components/product/data-summary";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Front Office" };

export function shouldRedirectToOnboarding(step: unknown) {
  return step !== "complete";
}

export default async function AppPage() {
  const { supabase, workspaceName } = await getWorkspaceContext();
  const { data: onboarding, error: onboardingError } = await supabase
    .from("onboarding_profiles")
    .select("step")
    .maybeSingle();
  if (!onboardingError && shouldRedirectToOnboarding(onboarding?.step)) redirect("/app/onboarding");
  const [
    { data: channelRows, count: channels, error: channelsError },
    { data: productions, count: productionCount, error: productionsError },
    { count: dna, error: dnaError },
    { count: assets, error: assetsError },
    { data: credits, error: creditsError },
    { data: jobs, error: jobsError },
    { data: signals, error: signalsError },
  ] = await Promise.all([
    supabase.from("channels").select("id, name, status, audience, voice, cadence, pillars, productions(id)", { count: "exact" }).order("created_at", { ascending: false }),
    supabase.from("productions").select("id, title, status, current_step, step_count, run_mode, channels(name)", { count: "exact" }).in("status", ["draft", "active", "paused"]).order("updated_at", { ascending: false }).limit(8),
    supabase.from("dna_records").select("id", { count: "exact", head: true }),
    supabase.from("generated_assets").select("id", { count: "exact", head: true }),
    supabase.from("credit_accounts").select("available, reserved").maybeSingle(),
    supabase.from("job_queue").select("id, kind, status, created_at, productions(title)").in("status", ["pending", "running", "failed"]).order("created_at", { ascending: false }).limit(6),
    supabase.from("signals").select("id, signal_type, title").eq("status", "active").order("created_at", { ascending: false }).limit(4),
  ]);
  const loadError = channelsError || productionsError || dnaError || assetsError || creditsError || jobsError || signalsError;

  return <section className="product-page shell">
    <div className="workspace-hero"><div><h1>{workspaceName}</h1><p className="lede">Site-wide channel, production, asset, and audience overview.</p></div><div className="credit-pill"><strong>{creditsError ? "—" : credits?.available ?? 0}</strong><span>credits available</span><small>{creditsError ? "Balance unavailable" : `${credits?.reserved ?? 0} reserved`}</small></div></div>
    {loadError ? <p className="form-error" role="alert">Some Front Office data could not load. Refresh to try again.</p> : null}
    <DataSummary channels={channelsError ? "—" : channels ?? 0} productions={productionsError ? "—" : productionCount ?? 0} dna={dnaError ? "—" : dna ?? 0} assets={assetsError ? "—" : assets ?? 0} />

    <section className="studio-section"><div className="section-head"><h2>Channels</h2><Link className="button button-outline" href="/app/marketing">Create channel</Link></div>
      {channelsError ? <p className="form-error" role="alert">Unable to load channels.</p> : channelRows?.length ? <div className="channel-list">{channelRows.map((channel) => <Link className="channel-row" href={`/app/channels/${channel.id}`} key={channel.id}><div className="channel-info"><h3>{channel.name}</h3><p>{channel.audience || "Audience not defined yet."}</p></div><div className="channel-meta"><span className="status-mark">{channel.status}</span><span>{Array.isArray(channel.productions) ? channel.productions.length : 0} productions</span><small>{channel.cadence || "Cadence open"} · {channel.voice || "Voice open"}</small></div></Link>)}</div> : <div className="panel empty-state"><h3>No channels yet.</h3><p>Define your first recurring outlet, then open its first production.</p><Link className="button button-primary" href="/app/marketing">Create channel</Link></div>}
    </section>

    <section className="studio-section" id="productions"><div className="section-head"><h2>Active productions</h2><span className="muted">13 connected departments</span></div>
      {productionsError ? <p className="form-error" role="alert">Unable to load productions.</p> : productions?.length ? <div className="production-list">{productions.map((production) => { const channel = production.channels as { name?: string } | null; const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1); return <Link className="production-row" href={`/app/productions/${production.id}`} key={production.id}><div><span className="channel-tag">{channel?.name ?? "Channel"} · {production.run_mode}</span><h3>{production.title}</h3></div><div className="mini-progress" aria-label={`Stage ${current + 1} of ${production.step_count}`}><span>{DEPARTMENTS[current]}</span><progress className="progress-bar" max={production.step_count || 13} value={current + 1} /></div><span className={`status-mark ${production.status}`}>{production.status}</span></Link>; })}</div> : <div className="panel empty-state"><p>No productions are active.</p></div>}
    </section>

    <div className="workspace-split">
      <section className="panel"><div className="section-head"><h2>Jobs</h2><Link href="/app/integrations">Integrations</Link></div>{jobsError ? <p className="form-error" role="alert">Unable to load jobs.</p> : jobs?.length ? <ul className="event-list">{jobs.map((job) => { const production = job.productions as { title?: string } | null; return <li key={job.id}><strong>{job.kind.replaceAll("_", " ")}</strong><span>{production?.title ?? "Studio task"}</span><span className={`status-mark ${job.status}`}>{job.status}</span></li>; })}</ul> : <p className="muted">No queued work.</p>}</section>
      <section className="panel"><div className="section-head"><h2>Signals</h2><Link href="/app/social">Social workshop</Link></div>{signalsError ? <p className="form-error" role="alert">Unable to load audience signals.</p> : signals?.length ? <ul className="event-list">{signals.map((signal) => <li key={signal.id}><strong>{signal.title}</strong><span>{signal.signal_type}</span></li>)}</ul> : <p className="muted">No audience signals yet.</p>}</section>
    </div>
  </section>;
}
