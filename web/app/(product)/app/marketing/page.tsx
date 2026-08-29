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

      <div className="workspace-split mt-6">
        {/* Left Column: Brand & Setup Checklist */}
        <div className="stack-lg">
          <section className="panel">
            <h2>Setup &amp; Brand Checklist</h2>
            <p className="muted">Track core studio identity and channel brief requirements before launching production.</p>
            <div className="stack mt-4">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="split-row text-xs"
                >
                  <div>
                    <strong>{item.label}</strong>
                    <p className="muted m-0">{item.description}</p>
                  </div>
                  <span className={`status-pill is-${item.status}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel marketing-brief">
            <h2>Add / Refine Channel Brief</h2>
            <p className="muted">Define audience, voice, cadence, and content pillars for a production channel.</p>
            <form action={createChannel} className="stack-form mt-4">
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
        <div className="stack-lg">
          <section className="panel">
            <h2>Marketing Department Roster</h2>
            <p className="muted">Six specialized agent roles managing brand continuity and audience intelligence.</p>
            <div className="stack mt-4">
              {MARKETING_AGENT_ROLES.map((role) => (
                <article
                  key={role.slug}
                  className="role-card"
                >
                  <div className="row-between">
                    <strong>{role.name}</strong>
                    <span className="mono text-xs accent">
                      6 files
                    </span>
                  </div>
                  <p className="muted text-xs m-0">{role.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Active Channels</h2>
            {channels?.length ? (
              <div className="stack mt-4">
                {channels.map((ch) => (
                  <article
                    key={ch.id}
                    className="channel-brief"
                  >
                    <strong>{ch.name}</strong>
                    <p className="muted text-xs m-0 mt-1">
                      {ch.audience ? `Audience: ${ch.audience}` : "Open audience"} · {ch.cadence || "Continuous"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                <p>No channels configured yet. Create one on the left or via studio onboarding.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
