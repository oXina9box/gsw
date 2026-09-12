"use client";

import { useState, type ReactNode } from "react";
import { useChannelView } from "@/components/product/use-channel-view";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { updateChannel, saveChannelMarketingBudget } from "@/app/(product)/actions";

type ChannelData = {
  id: string;
  name: string;
  status: string | null;
  audience: string | null;
  voice: string | null;
  cadence: string | null;
  pillars: string[] | null;
};

type BudgetData = {
  guideline_credits: number | null;
  notes: string | null;
  updated_at: string;
} | null;

type ProductionItem = {
  id: string;
  title: string;
  status: string;
  production_budget_guidelines: {
    guideline_credits?: number | null;
    notes?: string | null;
  } | null;
};

type ChannelMarketingClientProps = Readonly<{
  channel: ChannelData;
  budgetData: BudgetData;
  productions: ProductionItem[];
  totalProductionCredits: number;
  stageFloorSlot?: ReactNode;
}>;
export function ChannelMarketingClient({
  channel,
  budgetData,
  productions,
  totalProductionCredits,
  stageFloorSlot,
}: ChannelMarketingClientProps) {
  const { activeView } = useChannelView("marketing");
  const [creditInput, setCreditInput] = useState<number>(budgetData?.guideline_credits ?? 0);

  const addCredits = (amount: number) => {
    setCreditInput((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="space-y-4">

      {/* Marketing Stage Floor view */}
      {activeView === "stage-floor" && (
        <div className="space-y-4">
          {stageFloorSlot}
        </div>
      )}
      {/* Lane 01: Directives & Channel Onboarding Alignment */}
      {activeView === "onboarding" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold text-text">Channel Strategic Directives</h3>
            <p className="font-body text-xs text-text-muted">
              Configure core identity, voice, and distribution directives that guide all automated agent pipelines.
            </p>

            <form action={updateChannel} className="stack-form space-y-4">
              <input type="hidden" name="channel_id" value={channel.id} />
              <div>
                <label htmlFor="ch_name" className="block font-mono text-xs uppercase text-text-faint">
                  Channel Name
                </label>
                <input
                  id="ch_name"
                  name="name"
                  maxLength={120}
                  defaultValue={channel.name}
                  required
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-body text-sm text-text"
                />
              </div>

              <div>
                <label htmlFor="ch_aud" className="block font-mono text-xs uppercase text-text-faint">
                  Target Audience Persona
                </label>
                <input
                  id="ch_aud"
                  name="audience"
                  maxLength={500}
                  defaultValue={channel.audience ?? ""}
                  placeholder="e.g. Sci-Fi Enthusiasts, Cyberpunk Geeks (18–35)"
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-body text-sm text-text"
                />
              </div>

              <div>
                <label htmlFor="ch_voice" className="block font-mono text-xs uppercase text-text-faint">
                  Tone &amp; Voice Anchor
                </label>
                <input
                  id="ch_voice"
                  name="voice"
                  maxLength={500}
                  defaultValue={channel.voice ?? ""}
                  placeholder="e.g. Neo-Noir, Cynical Detective, High-Speed Pacing"
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-body text-sm text-text"
                />
              </div>

              <div>
                <label htmlFor="ch_cadence" className="block font-mono text-xs uppercase text-text-faint">
                  Release Cadence
                </label>
                <input
                  id="ch_cadence"
                  name="cadence"
                  maxLength={120}
                  defaultValue={channel.cadence ?? ""}
                  placeholder="e.g. Weekly episodic drop, Friday 18:00 UTC"
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-body text-sm text-text"
                />
              </div>

              <div>
                <label htmlFor="ch_pillars" className="block font-mono text-xs uppercase text-text-faint">
                  Content Pillars (Comma-separated)
                </label>
                <input
                  id="ch_pillars"
                  name="pillars"
                  maxLength={500}
                  defaultValue={channel.pillars?.join(", ") ?? ""}
                  placeholder="e.g. Lore Deep Dives, Visual Teasers, World Building"
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-body text-sm text-text"
                />
              </div>

              <button type="submit" className="button button-primary text-xs">
                Save Channel Directives
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-text">Directive Summary &amp; Persona</h3>
            <p className="font-body text-xs text-text-muted">
              These directives are injected into every stage brief across research, screenplays, and video prompts.
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] uppercase text-text-faint block">Current Audience</span>
                <span className="text-text font-body mt-0.5 block">{channel.audience || "Not specified"}</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] uppercase text-text-faint block">Tone of Voice</span>
                <span className="text-text font-body mt-0.5 block">{channel.voice || "Not specified"}</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] uppercase text-text-faint block">Content Pillars</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {channel.pillars?.length ? (
                    channel.pillars.map((pill) => (
                      <span key={pill} className="px-2 py-0.5 rounded-xs bg-pink/20 text-pink text-[11px]">
                        #{pill}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-faint">None defined</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lane 02: Research Hub */}
      {activeView === "research" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-text">Channel &amp; Audience Research Hub</h3>
              <p className="font-body text-xs text-text-muted">
                Market intelligence, competitor gap analyses, trending audio/visual formats, and audience demographic profiles.
              </p>
            </div>
            <FlowbiteBadge color="amber">Not connected</FlowbiteBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="font-mono text-xs uppercase text-cyan font-semibold block">Target Audience Demographics</span>
              <p className="font-body text-xs text-text">
                Connect an approved analytics source to view audience demographics for this channel.
              </p>
              <div className="pt-2 font-mono text-[10px] text-text-faint">No analytics source connected</div>
            </div>

            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="font-mono text-xs uppercase text-pink font-semibold block">Competitor Gap Analysis</span>
              <p className="font-body text-xs text-text">
                Competitor findings appear here after a research source is connected.
              </p>
              <div className="pt-2 font-mono text-[10px] text-text-faint">No findings available</div>
            </div>

            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="font-mono text-xs uppercase text-amber font-semibold block">Trending Formats &amp; Audio</span>
              <p className="font-body text-xs text-text">
                Trending formats and audio appear here after a research source is connected.
              </p>
              <div className="pt-2 font-mono text-[10px] text-text-faint">No recommendations available</div>
            </div>
          </div>
        </div>
      )}

      {/* Lane 03: Budgets & Credit Economics */}
      {activeView === "budgets" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 rounded-md border border-border bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-text">Credit Economy &amp; Budgets</h3>
                <p className="font-body text-xs text-text-muted">
                  Allocate generation credit ceilings and monitor spend across all active productions on {channel.name}.
                </p>
              </div>
              <span className="font-mono text-xs text-pink font-semibold">
                Guideline: {budgetData?.guideline_credits ?? 0}c
              </span>
            </div>

            <form action={saveChannelMarketingBudget} className="stack-form space-y-4">
              <input type="hidden" name="channel_id" value={channel.id} />
              <div>
                <label htmlFor="guideline_credits" className="block font-mono text-xs uppercase text-text-faint">
                  Channel Marketing Credit Guideline
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    id="guideline_credits"
                    type="number"
                    name="guideline_credits"
                    min="0"
                    value={creditInput}
                    onChange={(e) => setCreditInput(Number(e.target.value))}
                    className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-text"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => addCredits(250)}
                      className="px-2 py-1 rounded-sm bg-surface-3 border border-border text-[11px] font-mono hover:bg-surface"
                    >
                      +250c
                    </button>
                    <button
                      type="button"
                      onClick={() => addCredits(500)}
                      className="px-2 py-1 rounded-sm bg-surface-3 border border-border text-[11px] font-mono hover:bg-surface"
                    >
                      +500c
                    </button>
                    <button
                      type="button"
                      onClick={() => addCredits(1000)}
                      className="px-2 py-1 rounded-sm bg-surface-3 border border-border text-[11px] font-mono hover:bg-surface"
                    >
                      +1000c
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block font-mono text-xs uppercase text-text-faint">
                  Marketing &amp; Campaign Directives
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  maxLength={2000}
                  defaultValue={budgetData?.notes ?? ""}
                  placeholder="Target audience segments, promotional angles, paid acquisition experiments..."
                  className="mt-1 w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text"
                />
              </div>

              <button type="submit" className="button button-primary text-xs">
                Save Channel Budget
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-text">Production Spend Ledger</h3>
            <p className="font-body text-xs text-text-muted">
              Committed spend across {productions.length} productions (Total: {totalProductionCredits} credits).
            </p>

            {productions.length === 0 ? (
              <p className="font-mono text-xs text-text-faint py-4 text-center">No productions on this channel yet.</p>
            ) : (
              <ul className="divide-y divide-border font-mono text-xs">
                {productions.map((p) => {
                  const bg = p.production_budget_guidelines;
                  const c = bg?.guideline_credits ?? 0;
                  return (
                    <li key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-text font-medium block">{p.title}</span>
                        {bg?.notes ? <span className="text-[10px] text-text-faint">{bg.notes}</span> : null}
                      </div>
                      <span className="text-cyan font-semibold">{c}c</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Lane 04: Merchandise Desk */}
      {activeView === "merchandise" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Merchandise &amp; Physical Goods Desk</h3>
          <p className="font-body text-xs text-text-muted">
            Extend channel IP into physical products, limited-edition art books, apparel, and digital collectibles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Apparel &amp; Streetwear</span>
              <p className="text-text-muted text-[11px] font-body">
                Cyberpunk oversized hoodies, tactical cap designs with vector channel insignia.
              </p>
              <FlowbiteBadge color="amber" size="sm">Not connected</FlowbiteBadge>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Art Bibles &amp; Decks</span>
              <p className="text-text-muted text-[11px] font-body">
                Product catalog data is not connected for this channel.
              </p>
              <FlowbiteBadge color="amber" size="sm">Unavailable</FlowbiteBadge>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Digital Collectibles</span>
              <p className="text-text-muted text-[11px] font-body">
                Product catalog data is not connected for this channel.
              </p>
              <FlowbiteBadge color="amber" size="sm">Unavailable</FlowbiteBadge>
            </div>
          </div>
        </div>
      )}

      {/* Lane 05: Official Website Operations */}
      {activeView === "website" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Official Website &amp; Fan Destination</h3>
          <p className="font-body text-xs text-text-muted">
            Operate dedicated fan landing pages, premiere count-down timers, and subscriber capture funnels.
          </p>
          <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text font-semibold">Fan Portal URL</span>
              <span className="text-cyan">https://studio.gem/channels/{channel.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Landing Page Hero Mode</span>
              <span className="text-text">Cinematic Trailer Embed + Countdown</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Newsletter Subscribers</span>
              <span className="text-text-faint">Unavailable — analytics not connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Lane 06: Advertising Operations */}
      {activeView === "advertising" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Advertising &amp; Paid Acquisition Desk</h3>
          <p className="font-body text-xs text-text-muted">
            Stage multi-variant paid ads on Meta, YouTube, and TikTok to acquire high-retention episodic viewers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Variant A: High-Action Montage</span>
              <p className="text-text-muted text-[11px] font-body">
                15-second high-energy cut focusing on gun battles and neon cityscape flythroughs.
              </p>
              <div className="flex justify-between text-[10px] text-cyan pt-2">
                <span>Performance unavailable</span>
              </div>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Variant B: Mystery &amp; Dialogue</span>
              <p className="text-text-muted text-[11px] font-body">
                Intimate character monologue opening with suspenseful hook and sudden blackout.
              </p>
              <div className="flex justify-between text-[10px] text-pink pt-2">
                <span>Budget: $250</span>
                <span>CTR: 6.2% (Winning)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lane 07: Master Release Scheduling */}
      {activeView === "scheduling" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Master Release Scheduling</h3>
          <p className="font-body text-xs text-text-muted">
            Synchronize episode premiere times across streaming platforms and social teaser drops.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-sm bg-surface-2 border border-border flex items-center justify-between">
              <div>
                <span className="text-text font-semibold block">Ep 01: The Neon Genesis — Global Premiere</span>
                <span className="text-[11px] text-text-faint">Release Date: Oct 12, 2026 · 18:00 UTC</span>
              </div>
              <FlowbiteBadge color="lime">Scheduled</FlowbiteBadge>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border flex items-center justify-between">
              <div>
                <span className="text-text font-semibold block">Ep 02: Neural Fracture — Premiere</span>
                <span className="text-[11px] text-text-faint">Release Date: Oct 26, 2026 · 18:00 UTC</span>
              </div>
              <FlowbiteBadge color="cyan">In Production</FlowbiteBadge>
            </div>
          </div>
        </div>
      )}

      {/* Lane 08: Season Theming & Story Arcs */}
      {activeView === "theming" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Season Theming &amp; Narrative Arcs</h3>
          <p className="font-body text-xs text-text-muted">
            The overarching emotional, moral, and philosophical spine for this channel&apos;s active season.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] uppercase text-pink font-semibold block">Season 1 Core Premise</span>
              <p className="font-body text-sm text-text">
                &ldquo;In a megacity where memories can be bought and synthesized, one detective investigates a murder where the victim&apos;s consciousness was erased before their heart stopped.&rdquo;
              </p>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] uppercase text-cyan font-semibold block">Character Growth Vector</span>
              <p className="font-body text-xs text-text-muted">
                Protagonist starts as a cynical tool of the corporate police, gradually uncovers their own false memories, and chooses dangerous truth over synthetic comfort.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lane 09: Promos & Teaser Strategies */}
      {activeView === "promos" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Promos &amp; Teaser Packaging</h3>
          <p className="font-body text-xs text-text-muted">
            Fast-turnaround vertical hooks and cliffhangers designed to convert social scrollers into channel subscribers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">9:16 Vertical Hook Blueprint</span>
              <p className="text-text-muted text-[11px] font-body">
                0-3s Visual Shock &rarr; 3-8s Question/Mystery &rarr; 8-12s Action Burst &rarr; 12-15s Call to Watch Full Cut.
              </p>
              <FlowbiteBadge color="pink" size="sm">Template Locked</FlowbiteBadge>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2">
              <span className="text-text font-bold block">Cliffhanger Excerpt Vault</span>
              <p className="text-text-muted text-[11px] font-body">
                Key climax frames auto-isolated during Stage 10 video assembly for rapid social deployment.
              </p>
              <FlowbiteBadge color="amber" size="sm">No cuts available</FlowbiteBadge>
            </div>
          </div>
        </div>
      )}

      {/* Lane 10: Cross-Channel Synergy */}
      {activeView === "crosschannel" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Cross-Channel IP Synergy &amp; Crossovers</h3>
          <p className="font-body text-xs text-text-muted">
            Connect lore, characters, and storylines across sibling channels within the studio universe.
          </p>
          <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text font-semibold block">Shared universe anchors</span>
                <span className="text-[11px] text-text-faint">No linked channels available</span>
              </div>
              <FlowbiteBadge color="amber">Unavailable</FlowbiteBadge>
            </div>
            <p className="font-body text-xs text-text-muted">
              Cross-channel scheduling appears here after channels are linked.
            </p>
          </div>
        </div>
      )}

      {/* Lane 11: Reporting Rollup */}
      {activeView === "reporting" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Reporting &amp; Analytics Rollup</h3>
          <p className="font-body text-xs text-text-muted">
            Economic performance, generation efficiency, and cost-per-minute produced for {channel.name}.
          </p>
            <div className="rounded-sm border border-dashed border-border bg-surface-2 p-6 text-center font-mono text-xs text-text-muted">
              Reporting data is unavailable until an approved analytics and spend source is connected.
            </div>
        </div>
      )}

      {/* Lane 12: Lore & World Bible */}
      {activeView === "lore" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Lore &amp; Canon Continuity Engine</h3>
          <p className="font-body text-xs text-text-muted">
            Historical timelines, faction hierarchies, weapon and vehicle specifications, and slang dictionaries.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] uppercase text-cyan font-semibold block">Chronology &amp; Timeline</span>
              <p className="font-body text-xs text-text-muted">
                2084: The Neural Awakening &rarr; 2092: Megacity Wall Constructed &rarr; 2099: Present Day Crisis.
              </p>
            </div>
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-1">
              <span className="text-[10px] uppercase text-pink font-semibold block">Core Factions</span>
              <p className="font-body text-xs text-text-muted">
                1. The OmniCorp Directorate (Corporate police) · 2. The Glitch Syndicate (Underground hackers) · 3. The Purists.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lane 13: Legal & Rights */}
      {activeView === "legal" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Legal Clearance &amp; Rights Attestation</h3>
          <p className="font-body text-xs text-text-muted">
            Track copyright clearance, BYOK model commercial licensing, and voice clone safe-use attestations.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-sm bg-surface-2 border border-border flex items-center justify-between">
              <div>
                <span className="text-text font-semibold block">AI Generation Model Licensing</span>
                <span className="text-[11px] text-text-faint">No licensing record attached</span>
              </div>
              <FlowbiteBadge color="amber">Unavailable</FlowbiteBadge>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border flex items-center justify-between">
              <div>
                <span className="text-text font-semibold block">Audio &amp; Voice Synthesis Rights</span>
                <span className="text-[11px] text-text-faint">No voice-rights record attached</span>
              </div>
              <FlowbiteBadge color="amber">Unavailable</FlowbiteBadge>
            </div>
          </div>
        </div>
      )}

      {/* Lane 14: Core Values & Guardrails */}
      {activeView === "values" && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold text-text">Core Values &amp; Creative Guardrails</h3>
          <p className="font-body text-xs text-text-muted">
            Enforce automated safety ceilings, rating boundaries (e.g. PG-13), and ethical guardrails across all agent prompts.
          </p>
          <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Target Content Rating</span>
              <span className="text-text font-semibold">TV-14 / PG-13 (Stylized Violence, Zero Hate)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Automated Prompt Sanitization</span>
              <span className="text-lime font-semibold">Strict Guardrails Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Human Approval Gates</span>
              <span className="text-cyan font-semibold">Required for Stage 07 &amp; Stage 10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
