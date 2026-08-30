import { createChannel } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { evaluateMarketingChecklist, MARKETING_AGENT_ROLES } from "@/lib/studio/marketing";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Marketing Workbench" };

export default async function MarketingPage() {
  const { supabase } = await getWorkspaceContext();
  const { data: channels } = await supabase
    .from("channels")
    .select("id, name, audience, voice, cadence, pillars")
    .order("created_at");
  const { data: onboarding } = await supabase
    .from("onboarding_profiles")
    .select("studio_identity, channel_setup, lane_handoffs, missing_data_notes")
    .maybeSingle();

  const checklist = evaluateMarketingChecklist(onboarding ?? {});

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Marketing &amp; Studio Brand.
        </h1>
        <p className="text-base text-text-muted font-body">
          Direct studio brand strategy, audience positioning, and channel continuity across all production slates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Brand & Setup Checklist */}
        <div className="space-y-6">
          <PrelineCard
            kicker="Strategy Audit"
            title="Setup & Brand Checklist"
            subtitle="Track core studio identity and channel brief requirements"
          >
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-body text-sm text-text font-medium block">
                      {item.label}
                    </span>
                    <span className="text-xs text-text-muted font-mono">
                      {item.description}
                    </span>
                  </div>
                  <FlowbiteBadge color={item.status === "complete" ? "lime" : "amber"} size="sm">
                    {item.status}
                  </FlowbiteBadge>
                </div>
              ))}
            </div>
          </PrelineCard>

          <PrelineCard
            kicker="Channel Creation"
            title="Add / Refine Channel Brief"
            subtitle="Define audience, voice, cadence, and content pillars"
          >
            <form action={createChannel} className="stack-form">
              <label>
                Channel Name
                <input name="name" maxLength={120} required placeholder="Main Studio YouTube / TikTok" />
              </label>
              <label>
                Audience Demographics
                <textarea name="audience" maxLength={500} rows={2} placeholder="Who is the target audience?" />
              </label>
              <label>
                Brand Voice
                <textarea name="voice" maxLength={500} rows={2} placeholder="Tone, vocabulary, perspective" />
              </label>
              <label>
                Release Cadence
                <input name="cadence" maxLength={120} placeholder="e.g. Weekly, 3x / month" />
              </label>
              <label>
                Content Pillars (comma-separated)
                <input name="pillars" maxLength={500} placeholder="Sci-Fi, Character Lore, VFX breakdown" />
              </label>
              <button className="button button-primary" type="submit">
                Create Channel
              </button>
            </form>
          </PrelineCard>
        </div>

        {/* Right Column: Marketing Agent Team & Active Channels */}
        <div className="space-y-6">
          <PrelineCard
            kicker="Agent Specialization"
            title="Marketing Department Roster"
            subtitle="Six specialized agent roles managing brand continuity"
          >
            <div className="space-y-3">
              {MARKETING_AGENT_ROLES.map((role) => (
                <div key={role.slug} className="p-3 border border-border-2 bg-surface-2 rounded-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="font-display text-sm font-semibold text-text">
                      {role.name}
                    </strong>
                    <span className="font-mono text-xs text-cyan">
                      {role.slug}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-body">
                    {role.summary}
                  </p>
                </div>
              ))}
            </div>
          </PrelineCard>

          <PrelineCard
            kicker="Active Channels"
            title="Registered Outlets"
            subtitle={`${channels?.length ?? 0} active channels`}
          >
            {channels?.length ? (
              <div className="space-y-2">
                {channels.map((ch) => (
                  <div key={ch.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between">
                    <strong className="font-display text-sm text-text">{ch.name}</strong>
                    <span className="font-mono text-xs text-text-faint">{ch.cadence || "Open cadence"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">No channels created yet.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
