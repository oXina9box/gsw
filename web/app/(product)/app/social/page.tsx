import {
  approveReleasePackage,
  captureSocialReport,
  confirmReleasePublished,
  createReleasePackage,
  createSignal,
  promoteSignalToBrief,
} from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Social Workshop" };

export default async function SocialPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await getWorkspaceContext();
  const [{ data: signals }, { data: connections }, { data: packages }, { data: productions }, { data: reports }] = await Promise.all([
    supabase.from("signals").select("id, signal_type, title, body, status, created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("social_connections").select("id, platform, account_label, status").order("platform"),
    supabase.from("release_packages").select("id, production_id, platform, caption, status, productions(title)").order("created_at", { ascending: false }).limit(30),
    supabase.from("productions").select("id, title").order("updated_at", { ascending: false }).limit(30),
    supabase.from("social_reports").select("id, release_package_id, report_type, notes, metrics, captured_at").order("captured_at", { ascending: false }).limit(30),
  ]);
  const { error } = await searchParams;

  return (
    <section className="product-page shell" data-archetype="B2-C">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Release. Listen. Feed it back.
        </h1>
        <p className="text-base text-text-muted font-body">
          Plan releases and save manual audience signals as structured inputs for the next production. Direct posting and analytics sync are not enabled in this build.
        </p>
      </div>

      {error ? <p className="form-error mb-6" role="alert">Social operation failed.</p> : null}

      <div className="platform-strip mb-8">
        {["youtube", "instagram", "facebook", "tiktok", "x"].map((platform) => {
          const connection = connections?.find((item) => item.platform === platform);
          return (
            <div key={platform}>
              <strong>{platform}</strong>
              <FlowbiteBadge color={connection?.status === "connected" ? "lime" : "default"} size="sm">
                {connection ? connection.account_label : "not connected"}
              </FlowbiteBadge>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <PrelineCard
            kicker="Intelligence Loop"
            title="Signal board"
            subtitle={`${signals?.length ?? 0} active observation signals`}
          >
            {signals?.length ? (
              <div className="grid grid-cols-1 gap-3">
                {signals.map((signal) => (
                  <article className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-2" key={signal.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan uppercase">{signal.signal_type}</span>
                      <FlowbiteBadge size="sm">{signal.status}</FlowbiteBadge>
                    </div>
                    <h3 className="font-display text-base font-semibold text-text">{signal.title}</h3>
                    <p className="text-xs text-text-muted font-body">{signal.body}</p>
                    <form action={promoteSignalToBrief} className="inline-form pt-2">
                      <input type="hidden" name="signal_id" value={signal.id} />
                      <button className="button button-outline text-xs" type="submit">
                        Promote to next brief
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No signals yet. Add first observation manually.</p>
              </div>
            )}

            <form action={createSignal} className="stack-form pt-4 border-t border-border mt-4">
              <h3 className="font-display text-sm font-semibold text-text">Add manual signal</h3>
              <label>
                Type
                <select name="signal_type" defaultValue="manual_review">
                  <option value="manual_review">Manual review</option>
                  <option value="audience_feedback">Audience feedback</option>
                  <option value="metric_anomaly">Metric anomaly</option>
                  <option value="platform_trend">Platform trend</option>
                </select>
              </label>
              <label>
                Title
                <input name="title" required maxLength={120} placeholder="High retention on Scene 04 hook" />
              </label>
              <label>
                Notes
                <textarea name="body" required rows={3} placeholder="Key audience takeaway to carry into the next production brief" />
              </label>
              <button className="button button-primary" type="submit">
                Record signal
              </button>
            </form>
          </PrelineCard>
        </div>

        <div className="space-y-6">
          <PrelineCard
            kicker="Release Matrix"
            title="Release packages"
            subtitle={`${packages?.length ?? 0} platform deliverables`}
          >
            {packages?.length ? (
              <div className="space-y-3">
                {packages.map((pkg) => {
                  const production = pkg.productions as { title?: string } | null;
                  return (
                    <div key={pkg.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-pink uppercase">{pkg.platform}</span>
                        <FlowbiteBadge color={pkg.status === "published" ? "lime" : "amber"} size="sm">
                          {pkg.status}
                        </FlowbiteBadge>
                      </div>
                      <p className="text-xs text-text-muted font-body truncate">{pkg.caption || "No caption set"}</p>
                      <small className="font-mono text-[10px] text-text-faint block">{production?.title ?? "Studio task"}</small>

                      <div className="flex gap-2 pt-2">
                        {pkg.status === "draft" && (
                          <form action={approveReleasePackage}>
                            <input type="hidden" name="package_id" value={pkg.id} />
                            <button className="button button-outline text-xs" type="submit">
                              Approve package
                            </button>
                          </form>
                        )}
                        {pkg.status === "approved" && (
                          <form action={confirmReleasePublished}>
                            <input type="hidden" name="package_id" value={pkg.id} />
                            <button className="button button-primary text-xs" type="submit">
                              Confirm published
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">No release packages planned yet.</p>
            )}

            <form action={createReleasePackage} className="stack-form pt-4 border-t border-border mt-4">
              <h3 className="font-display text-sm font-semibold text-text">Plan release package</h3>
              <label>
                Production
                <select name="production_id" required defaultValue="">
                  <option value="" disabled>Select production</option>
                  {(productions ?? []).map((prod) => (
                    <option value={prod.id} key={prod.id}>{prod.title}</option>
                  ))}
                </select>
              </label>
              <label>
                Platform
                <select name="platform" defaultValue="youtube">
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="x">X</option>
                </select>
              </label>
              <label>
                Caption
                <textarea name="caption" rows={2} placeholder="Platform-native copy, hashtags, and CTA" />
              </label>
              <button className="button button-primary" type="submit">
                Create package
              </button>
            </form>
          </PrelineCard>

          <PrelineCard
            kicker="Manual Reports"
            title="Performance Reports"
            subtitle={`${reports?.length ?? 0} manual observation logs`}
          >
            <form action={captureSocialReport} className="stack-form">
              <label>
                Release Package
                <select name="release_package_id" required defaultValue="">
                  <option value="" disabled>Select package</option>
                  {(packages ?? []).map((pkg) => (
                    <option value={pkg.id} key={pkg.id}>{pkg.platform} · {pkg.id.slice(0, 8)}</option>
                  ))}
                </select>
              </label>
              <label>
                Report Type
                <input name="report_type" defaultValue="manual_snapshot" />
              </label>
              <label>
                Notes
                <textarea name="notes" rows={2} placeholder="Observations on views, comments, audience response" />
              </label>
              <button className="button button-outline" type="submit">
                Capture report
              </button>
            </form>
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
