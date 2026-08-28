import { createChannel } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { evaluateMarketingChecklist, MARKETING_AGENT_ROLES } from "@/lib/studio/marketing";

export const metadata = { title: "Marketing Workbench" };

export default async function MarketingPage() {
  const { supabase } = await getWorkspaceContext();
  const { data: channels } = await supabase.from("channels").select("id, name, audience, voice, cadence, pillars").order("created_at");
  const { data: onboarding } = await supabase.from("onboarding_profiles").select("studio_identity, channel_setup, lane_handoffs, missing_data_notes").maybeSingle();

  const checklist = evaluateMarketingChecklist(onboarding ?? {});

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <h1>Marketing &amp; Studio Brand.</h1>
      <p className="lede">Direct studio brand strategy, audience positioning, and channel continuity across all production slates.</p>

      <div className="workspace-split" style={{ marginTop: "1.5rem" }}>
        {/* Left Column: Brand & Setup Checklist */}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <section className="panel">
            <h2>Setup &amp; Brand Checklist</h2>
            <p className="muted">Track core studio identity and channel brief requirements before launching production.</p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  <div>
                    <strong>{item.label}</strong>
                    <p className="muted" style={{ margin: 0 }}>{item.description}</p>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      color: item.status === "complete" ? "var(--color-success)" : item.status === "deferred" ? "var(--color-warning)" : "var(--color-danger)",
                      background: item.status === "complete" ? "rgba(16,185,129,0.08)" : item.status === "deferred" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel marketing-brief">
            <h2>Add / Refine Channel Brief</h2>
            <p className="muted">Define audience, voice, cadence, and content pillars for a production channel.</p>
            <form action={createChannel} className="stack-form" style={{ marginTop: "1rem" }}>
              <label>Channel name
                <input name="name" maxLength={120} required placeholder="e.g. Cyberpunk Noir Shorts" />
              </label>
              <label>Target audience
                <textarea name="audience" maxLength={500} rows={2} placeholder="Who should care, and why?" />
              </label>
              <label>Voice &amp; Visual aesthetic
                <textarea name="voice" maxLength={500} rows={2} placeholder="Measured, strange, visually bold, neon shadows" />
              </label>
              <div className="form-grid">
                <label>Cadence
                  <input name="cadence" maxLength={120} placeholder="e.g. Bi-weekly releases" />
                </label>
                <label>Content pillars
                  <input name="pillars" maxLength={500} placeholder="Hard sci-fi, AI ethics, deep space" />
                </label>
              </div>
              <button className="button button-primary" type="submit">Save Channel Brief</button>
            </form>
          </section>
        </div>

        {/* Right Column: Marketing Agent Team & Active Channels */}
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <section className="panel">
            <h2>Marketing Department Roster</h2>
            <p className="muted">Six specialized agent roles managing brand continuity and audience intelligence.</p>
            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {MARKETING_AGENT_ROLES.map((role) => (
                <article
                  key={role.slug}
                  style={{
                    padding: "0.75rem",
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    display: "grid",
                    gap: "0.25rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{role.name}</strong>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-accent)" }}>
                      6 files
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: "var(--text-xs)", margin: 0 }}>{role.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Active Channels</h2>
            {channels?.length ? (
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                {channels.map((ch) => (
                  <article
                    key={ch.id}
                    style={{
                      padding: "0.75rem",
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <strong>{ch.name}</strong>
                    <p className="muted" style={{ fontSize: "var(--text-xs)", margin: "0.25rem 0 0" }}>
                      {ch.audience ? `Audience: ${ch.audience}` : "Open audience"} · {ch.cadence || "Continuous"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: "1rem" }}>
                <p>No channels configured yet. Create one on the left or via studio onboarding.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
