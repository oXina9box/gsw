import Link from "next/link";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { FlowbiteProgress } from "@/components/blocks/flowbite/flowbite-progress";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Studio" };

export default async function StudioPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ data: productions, error: productionsError }, { data: jobs, error: jobsError }] = await Promise.all([
    supabase.from("productions").select("id, title, status, current_step, step_count, run_mode, scheduled_at, channels(name)").in("status", ["draft", "active", "paused"]).order("scheduled_at", { ascending: true, nullsFirst: false }).limit(12),
    supabase.from("job_queue").select("id, kind, status, productions(title)").in("status", ["pending", "running", "failed"]).order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <section className="product-page shell" data-archetype="B2-A">
      <div className="section-head mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            Production floor.
          </h1>
          <p className="text-base text-text-muted font-body mt-1">
            Upcoming releases, open productions, and agent work in motion.
          </p>
        </div>
        <Link className="button button-primary" href="/app/front-office">
          Open production
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <PrelineCard
            kicker="Live Pipeline"
            title="Open productions"
            subtitle={productionsError ? "Status unavailable" : `${productions?.length ?? 0} active slates`}
          >
            {productionsError ? (
              <p className="form-error" role="alert">Unable to load open productions.</p>
            ) : productions?.length ? (
              <div className="divide-y divide-border-2">
                {productions.map((production) => {
                  const channel = production.channels as { name?: string } | null;
                  const current = Math.min(production.current_step ?? 0, DEPARTMENTS.length - 1);
                  const progressPct = Math.round(((current + 1) / (production.step_count || 13)) * 100);

                  return (
                    <Link
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-2 p-3 rounded-sm transition-colors duration-150"
                      href={`/app/productions/${production.id}`}
                      key={production.id}
                    >
                      <div className="space-y-1">
                        <span className="font-mono text-xs text-text-faint">
                          {channel?.name ?? "Channel"} · {production.run_mode}
                        </span>
                        <h3 className="font-display text-lg font-semibold text-text">
                          {production.title}
                        </h3>
                        <small className="font-mono text-xs text-text-muted block">
                          {production.scheduled_at
                            ? `Release ${new Date(production.scheduled_at).toLocaleDateString()}`
                            : "Release date open"}
                        </small>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="w-36">
                          <FlowbiteProgress
                            progress={progressPct}
                            label={DEPARTMENTS[current]}
                            size="sm"
                            color="pink"
                          />
                        </div>
                        <FlowbiteBadge
                          color={production.status === "active" ? "lime" : "amber"}
                          size="sm"
                        >
                          {production.status}
                        </FlowbiteBadge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No open productions. Use the front office to open a brief.</p>
                <Link className="button button-primary" href="/app/front-office">
                  Open production
                </Link>
              </div>
            )}
          </PrelineCard>
        </div>

        <div className="lg:col-span-4">
          <PrelineCard
            kicker="Execution Queue"
            title="Workflow status"
            subtitle="Background agent jobs"
            footer={
              <Link href="/app/orchestration" className="text-cyan hover:underline font-mono text-xs">
                View Orchestration →
              </Link>
            }
          >
            {jobsError ? (
              <p className="form-error" role="alert">Unable to load workflow status.</p>
            ) : jobs?.length ? (
              <ul className="space-y-3">
                {jobs.map((job) => {
                  const production = job.productions as { title?: string } | null;
                  return (
                    <li key={job.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="font-mono text-xs text-text capitalize">
                          {job.kind.replaceAll("_", " ")}
                        </strong>
                        <FlowbiteBadge
                          color={job.status === "running" ? "cyan" : job.status === "failed" ? "red" : "amber"}
                          size="sm"
                        >
                          {job.status}
                        </FlowbiteBadge>
                      </div>
                      <span className="text-xs text-text-muted font-body block truncate">
                        {production?.title ?? "Studio task"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-text-muted font-body">No queued work.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
