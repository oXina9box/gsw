import Link from "next/link";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineStatsGrid, type PrelineStat } from "@/components/blocks/preline/preline-stats-grid";
import { FlowbiteBadge, type BadgeColor } from "@/components/blocks/flowbite/flowbite-badge";
import { FlowbiteProgress } from "@/components/blocks/flowbite/flowbite-progress";

export const metadata = { title: "Front Office" };

export default async function AppPage() {
  const { supabase, workspaceName } = await getWorkspaceContext();
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

  const stats: PrelineStat[] = [
    {
      label: "Channels",
      value: channelsError ? "—" : channels ?? 0,
      subtext: "Active distribution outlets",
    },
    {
      label: "Productions",
      value: productionsError ? "—" : productionCount ?? 0,
      subtext: "Current pipeline slates",
    },
    {
      label: "DNA Continuity",
      value: dnaError ? "—" : dna ?? 0,
      subtext: "Locked character & prop records",
    },
    {
      label: "Master Assets",
      value: assetsError ? "—" : assets ?? 0,
      subtext: "Generated takes & finals",
    },
  ];

  const getStatusColor = (status: string): BadgeColor => {
    switch (status) {
      case "active":
      case "completed":
      case "published":
        return "lime";
      case "running":
      case "semi_auto":
        return "cyan";
      case "failed":
      case "dead":
        return "red";
      case "pending":
      case "draft":
      case "manual":
        return "amber";
      default:
        return "pink";
    }
  };

  return (
    <section className="product-page shell" data-archetype="B1-A">
      <div className="workspace-hero">
        <div>
          <h1>{workspaceName}</h1>
          <p className="lede">Site-wide channel, production, asset, and audience overview.</p>
        </div>
        <div className="credit-pill">
          <strong>{creditsError ? "—" : credits?.available ?? 0}</strong>
          <span>credits available</span>
          <small>{creditsError ? "Balance unavailable" : `${credits?.reserved ?? 0} reserved`}</small>
        </div>
      </div>

      <section className="panel mb-6 flex flex-wrap items-center justify-between gap-4" aria-labelledby="setup-heading">
        <div>
          <p className="kicker">Optional setup</p>
          <h2 id="setup-heading">Make this studio yours</h2>
          <p className="muted">Add identity, providers, departments, or a starter channel whenever you are ready.</p>
        </div>
        <Link className="button button-outline" href="/app/onboarding">Open studio setup</Link>
      </section>

      {loadError ? (
        <p className="form-error" role="alert">
          Some Front Office data could not load. Refresh to try again.
        </p>
      ) : null}

      <div className="my-6">
        <PrelineStatsGrid stats={stats} columns={4} />
      </div>

      <section className="studio-section">
        <div className="section-head">
          <h2>Channels</h2>
          <Link className="button button-outline" href="/app/marketing">
            Create channel
          </Link>
        </div>
        {channelsError ? (
          <p className="form-error" role="alert">Unable to load channels.</p>
        ) : channelRows?.length ? (
          <div className="channel-list">
            {channelRows.map((channel) => (
              <Link className="channel-row" href={`/app/channels/${channel.id}`} key={channel.id}>
                <div className="channel-info">
                  <h3>{channel.name}</h3>
                  <p>{channel.audience || "Audience not defined yet."}</p>
                </div>
                <div className="channel-meta">
                  <FlowbiteBadge color={getStatusColor(channel.status ?? "active")}>
                    {channel.status}
                  </FlowbiteBadge>
                  <span>{Array.isArray(channel.productions) ? channel.productions.length : 0} productions</span>
                  <small>{channel.cadence || "Cadence open"} · {channel.voice || "Voice open"}</small>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <h3>No channels yet.</h3>
            <p>Define your first recurring outlet, then open productions under its audience rules.</p>
            <Link className="button button-primary" href="/app/marketing">
              Create channel
            </Link>
          </div>
        )}
      </section>

      <section className="studio-section" id="productions">
        <div className="section-head">
          <h2>Active productions</h2>
          <span className="muted">13 connected departments</span>
        </div>
        {productionsError ? (
          <p className="form-error" role="alert">Unable to load productions.</p>
        ) : productions?.length ? (
          <div className="production-list">
            {productions.map((production) => {
              const channel = production.channels as { name?: string } | null;
              const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1);
              const progressPct = Math.round(((current + 1) / (production.step_count || 13)) * 100);

              return (
                <Link className="production-row" href={`/app/productions/${production.id}`} key={production.id}>
                  <div>
                    <span className="channel-tag">{channel?.name ?? "Channel"} · {production.run_mode}</span>
                    <h3>{production.title}</h3>
                  </div>
                  <div className="mini-progress min-w-[12rem]" aria-label={`Stage ${current + 1} of ${production.step_count}`}>
                    <FlowbiteProgress
                      progress={progressPct}
                      label={DEPARTMENTS[current]}
                      size="sm"
                      color="pink"
                    />
                  </div>
                  <FlowbiteBadge color={getStatusColor(production.status)}>
                    {production.status}
                  </FlowbiteBadge>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="panel empty-state">
            <h3>No active productions.</h3>
            <p>Open a brief to start a 13-stage production workflow.</p>
            <Link className="button button-primary" href="/app/front-office">
              Open production
            </Link>
          </div>
        )}
      </section>

      <div className="workspace-split">
        <section className="panel">
          <div className="section-head">
            <h2>Jobs</h2>
            <Link href="/app/integrations">Integrations</Link>
          </div>
          {jobsError ? (
            <p className="form-error" role="alert">Unable to load jobs.</p>
          ) : jobs?.length ? (
            <ul className="event-list">
              {jobs.map((job) => {
                const production = job.productions as { title?: string } | null;
                return (
                  <li key={job.id}>
                    <strong>{job.kind.replaceAll("_", " ")}</strong>
                    <span>{production?.title ?? "Studio task"}</span>
                    <FlowbiteBadge color={getStatusColor(job.status)} size="sm">
                      {job.status}
                    </FlowbiteBadge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">No queued work.</p>
          )}
        </section>
        <section className="panel">
          <div className="section-head">
            <h2>Signals</h2>
            <Link href="/app/social">Social workshop</Link>
          </div>
          {signalsError ? (
            <p className="form-error" role="alert">Unable to load audience signals.</p>
          ) : signals?.length ? (
            <ul className="event-list">
              {signals.map((signal) => (
                <li key={signal.id}>
                  <strong>{signal.title}</strong>
                  <span>{signal.signal_type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No audience signals yet.</p>
          )}
        </section>
      </div>
    </section>
  );
}
