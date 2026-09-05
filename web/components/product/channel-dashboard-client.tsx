"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { FlowbiteProgress } from "@/components/blocks/flowbite/flowbite-progress";
import { DEPARTMENTS } from "@/lib/studio/domain";

type ChannelData = {
  id: string;
  name: string;
  status: string | null;
  audience: string | null;
  voice: string | null;
  cadence: string | null;
  pillars: string[] | null;
};

type ProductionItem = {
  id: string;
  title: string;
  status: string;
  current_step: number | null;
  step_count: number | null;
  run_mode: string;
  scheduled_at: string | null;
  updated_at: string;
};

type ChannelDashboardClientProps = Readonly<{
  channel: ChannelData;
  productions: ProductionItem[];
}>;

type ThemeOption = "studio-dark" | "cyber-cyan" | "amber-glow" | "executive-mono";

const THEMES: Record<ThemeOption, { label: string; accent: string; border: string }> = {
  "studio-dark": { label: "Studio Dark", accent: "text-pink", border: "border-border" },
  "cyber-cyan": { label: "Cyber Cyan", accent: "text-cyan", border: "border-cyan/40" },
  "amber-glow": { label: "Amber Glow", accent: "text-amber", border: "border-amber/40" },
  "executive-mono": { label: "Executive Mono", accent: "text-text", border: "border-white/20" },
};

export function ChannelDashboardClient({ channel, productions }: ChannelDashboardClientProps) {
  const [theme, setTheme] = useState<ThemeOption>("studio-dark");
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Widget visibility toggles
  const [widgets, setWidgets] = useState({
    telemetry: true,
    socialStats: true,
    productionSlate: true,
    planning: true,
    traffic: true,
    merch: true,
    geoMap: true,
    directives: true,
  });

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev [key] }));
  };

  const activeTheme = THEMES[theme];
  const activeCount = productions.filter((p) => p.status === "in_flight" || p.status === "running").length;
  const completedCount = productions.filter((p) => p.status === "completed" || p.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: View-Only Notice, Theme Selector, Customize Board Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-md border border-border bg-surface-2">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-lime animate-pulse" aria-hidden="true" />
          <span>View-Only Live Mission Control · Everything in {channel.name} rolls up here</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-mono text-xs text-text-faint">
            Theme:
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeOption)}
              className="rounded-sm border border-border bg-surface px-2 py-1 font-mono text-xs text-text focus:outline-none focus:ring-1 focus:ring-cyan"
            >
              {Object.entries(THEMES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="font-mono text-xs px-3 py-1 rounded-sm border border-border bg-surface text-text hover:border-border-2 hover:bg-surface-3 transition-colors"
          >
            {showCustomizer ? "Close Board Config" : "Customize Board ▾"}
          </button>
        </div>
      </div>

      {/* Customize Board Panel */}
      {showCustomizer && (
        <div className="p-4 rounded-md border border-cyan/40 bg-surface space-y-3">
          <h3 className="font-display text-sm font-semibold text-text">Customize Visible Widgets</h3>
          <p className="font-body text-xs text-text-muted">
            Toggle which statistical monitors and reporting modules are displayed on this channel stat board.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
            {Object.entries(widgets).map(([key, isVisible]) => (
              <label key={key} className="flex items-center gap-2 text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleWidget(key as keyof typeof widgets)}
                  className="rounded border-border bg-surface-2 text-pink focus:ring-cyan"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 1. High-Density Telemetry Strip */}
      {widgets.telemetry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-md border ${activeTheme.border} bg-surface space-y-1`}>
            <span className="font-mono text-xs uppercase text-text-faint">Total Audience Reach</span>
            <p className={`font-display text-2xl sm:text-3xl font-bold ${activeTheme.accent}`}>4.8M</p>
            <span className="font-mono text-[10px] text-lime font-medium">+14.2% velocity this month</span>
          </div>
          <div className={`p-4 rounded-md border ${activeTheme.border} bg-surface space-y-1`}>
            <span className="font-mono text-xs uppercase text-text-faint">Average Watch Retention</span>
            <p className="font-display text-2xl sm:text-3xl font-bold text-text">74.2%</p>
            <span className="font-mono text-[10px] text-cyan font-medium">Above channel baseline</span>
          </div>
          <div className={`p-4 rounded-md border ${activeTheme.border} bg-surface space-y-1`}>
            <span className="font-mono text-xs uppercase text-text-faint">Production Slate Health</span>
            <p className="font-display text-2xl sm:text-3xl font-bold text-text">
              {activeCount} <span className="text-sm font-normal text-text-muted">active</span> / {completedCount} <span className="text-sm font-normal text-text-muted">done</span>
            </p>
            <span className="font-mono text-[10px] text-lime font-medium">100% jobs succeeded</span>
          </div>
          <div className={`p-4 rounded-md border ${activeTheme.border} bg-surface space-y-1`}>
            <span className="font-mono text-xs uppercase text-text-faint">Media Vault Footprint</span>
            <p className="font-display text-2xl sm:text-3xl font-bold text-text">24.8 GB</p>
            <span className="font-mono text-[10px] text-text-muted">412 active channel assets</span>
          </div>
        </div>
      )}

      {/* 2. Social Media Stat Board (All Platforms Consolidated) */}
      {widgets.socialStats && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-text">Social Media Stat Board</h2>
              <p className="font-body text-xs text-text-muted">
                Consolidated live telemetry across YouTube, TikTok, X, Instagram, Facebook, Discord, Telegram, and Snapchat.
              </p>
            </div>
            <Link
              href={`/app/channels/${channel.id}/social`}
              className="font-mono text-xs text-cyan hover:underline"
            >
              Open Social Workshop &amp; Inbox &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
            <div className="p-3 rounded-sm bg-surface-2 border border-border">
              <span className="text-[10px] uppercase text-text-faint block">Total Posts</span>
              <span className="text-xl font-bold text-text">142</span>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border">
              <span className="text-[10px] uppercase text-text-faint block">Posts This Week</span>
              <span className="text-xl font-bold text-cyan">12</span>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border">
              <span className="text-[10px] uppercase text-text-faint block">Comments</span>
              <span className="text-xl font-bold text-text">18.4k</span>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border">
              <span className="text-[10px] uppercase text-text-faint block">Shares</span>
              <span className="text-xl font-bold text-text">9.2k</span>
            </div>
            <div className="p-3 rounded-sm bg-surface-2 border border-border col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-text-faint block">Total Likes</span>
              <span className="text-xl font-bold text-pink">284k</span>
            </div>
          </div>

          {/* Optimal Posting Time Heatmap Visualization */}
          <div className="space-y-2 pt-2">
            <span className="font-mono text-xs uppercase text-text-faint block">
              Optimal Posting Schedule Heatmap (Peak Engagement Times)
            </span>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                <div key={day} className="space-y-1">
                  <span className="text-text-muted block">{day}</span>
                  <div
                    className={`py-2 rounded-xs text-text-contrast ${
                      idx === 1 || idx === 3 || idx === 4
                        ? "bg-pink text-white font-bold"
                        : idx === 0 || idx === 2
                        ? "bg-cyan/60 text-white"
                        : "bg-surface-3 text-text-muted"
                    }`}
                  >
                    {idx === 1 ? "18:00" : idx === 3 ? "20:30" : idx === 4 ? "17:00" : "14:00"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. 12-Column Modular Stat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col (Col 1-8): Production Slate & Read-Only Node State Monitor */}
        {widgets.productionSlate && (
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-md border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-display text-lg font-semibold text-text">
                    Production Slate &amp; Node State Monitor
                  </h2>
                  <p className="font-body text-xs text-text-muted">
                    If it&apos;s created or completed on this channel, it appears here. Node execution is viewed, not managed.
                  </p>
                </div>
                <Link
                  href={`/app/channels/${channel.id}/production`}
                  className="font-mono text-xs text-cyan hover:underline"
                >
                  Open 13-Stage Node Canvas &rarr;
                </Link>
              </div>

              {productions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-text-muted text-sm font-body">No productions initialized for this channel yet.</p>
                  <Link
                    href={`/app/channels/${channel.id}/production`}
                    className="inline-block font-mono text-xs text-pink hover:underline"
                  >
                    Initialize First Production Slate &rarr;
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border space-y-3">
                  {productions.map((p) => {
                    const current = Math.min(p.current_step ?? 0, DEPARTMENTS.length - 1);
                    const progressPct = Math.round(((current + 1) / (p.step_count || 13)) * 100);

                    return (
                      <div key={p.id} className="pt-3 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] uppercase text-text-faint">
                              {p.run_mode} · {p.status}
                            </span>
                            <h3 className="font-display text-base font-semibold text-text">{p.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <FlowbiteBadge
                              color={p.status === "completed" || p.status === "published" ? "lime" : "cyan"}
                              size="sm"
                            >
                              {p.status}
                            </FlowbiteBadge>
                            <Link
                              href={`/app/channels/${channel.id}/production?productionId=${p.id}`}
                              className="font-mono text-xs text-cyan hover:underline"
                            >
                              View Node Graph &rarr;
                            </Link>
                          </div>
                        </div>

                        <div className="w-full">
                          <FlowbiteProgress
                            progress={progressPct}
                            label={DEPARTMENTS[current]}
                            size="sm"
                            color="cyan"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Read-Only Strategic Directives Card (View-Only Invariant) */}
            {widgets.directives && (
              <div className="rounded-md border border-border bg-surface p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-display text-base font-semibold text-text">Strategic Directives</h3>
                  <Link
                    href={`/app/channels/${channel.id}/marketing`}
                    className="font-mono text-xs text-pink hover:underline"
                  >
                    Edit in Marketing &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                    <span className="text-[10px] uppercase text-text-faint block">Target Audience</span>
                    <p className="text-text font-body">{channel.audience || "Open Audience"}</p>
                  </div>
                  <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                    <span className="text-[10px] uppercase text-text-faint block">Tone &amp; Voice Anchor</span>
                    <p className="text-text font-body">{channel.voice || "Consistent Studio Tone"}</p>
                  </div>
                  <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                    <span className="text-[10px] uppercase text-text-faint block">Release Cadence</span>
                    <p className="text-text font-body">{channel.cadence || "Periodic Drops"}</p>
                  </div>
                  <div className="p-3 rounded-sm bg-surface-2 border border-border space-y-1">
                    <span className="text-[10px] uppercase text-text-faint block">Editorial Pillars</span>
                    <p className="text-text font-body">
                      {channel.pillars?.length ? channel.pillars.join(" · ") : "Not defined"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Col (Col 9-12): Planning, Calendar, Website & Merchandise */}
        <div className="lg:col-span-4 space-y-6">
          {/* Multi-Track Drop Calendar */}
          {widgets.planning && (
            <div className="rounded-md border border-border bg-surface p-5 space-y-3">
              <h3 className="font-display text-base font-semibold text-text">Release Drop Calendar</h3>
              <ul className="divide-y divide-border font-mono text-xs space-y-2">
                <li className="pt-2 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-text font-medium block">Oct 12 · YouTube</span>
                    <span className="text-[11px] text-text-muted">Ep 01 Master 4K Drop</span>
                  </div>
                  <FlowbiteBadge color="lime" size="sm">Scheduled</FlowbiteBadge>
                </li>
                <li className="pt-2 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-text font-medium block">Oct 14 · TikTok</span>
                    <span className="text-[11px] text-text-muted">9:16 Vertical Teaser Cut</span>
                  </div>
                  <FlowbiteBadge color="cyan" size="sm">Staged</FlowbiteBadge>
                </li>
                <li className="pt-2 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-text font-medium block">Oct 18 · Discord</span>
                    <span className="text-[11px] text-text-muted">Live Watch Party &amp; Q&amp;A</span>
                  </div>
                  <FlowbiteBadge color="pink" size="sm">Event</FlowbiteBadge>
                </li>
              </ul>
            </div>
          )}

          {/* Website Traffic Telemetry */}
          {widgets.traffic && (
            <div className="rounded-md border border-border bg-surface p-5 space-y-3">
              <h3 className="font-display text-base font-semibold text-text">Website &amp; Traffic</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Unique Visitors (7D)</span>
                  <span className="text-text font-semibold">84,200 (+18%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Avg Watch Time</span>
                  <span className="text-text font-semibold">6m 42s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Landing Page Conv.</span>
                  <span className="text-cyan font-semibold">8.4%</span>
                </div>
              </div>
            </div>
          )}

          {/* Merchandise & Commerce */}
          {widgets.merch && (
            <div className="rounded-md border border-border bg-surface p-5 space-y-3">
              <h3 className="font-display text-base font-semibold text-text">Merchandise &amp; Commerce</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Gross Revenue</span>
                  <span className="text-lime font-semibold">$14,280</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Orders Fulfilled</span>
                  <span className="text-text font-semibold">324 units</span>
                </div>
                <div className="border-t border-border pt-2 text-[11px] text-text-faint">
                  Top SKU: <span className="text-text font-medium">Cyberpunk Neon Hoodie (94 units)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Global Audience Geographic Map & Demographic Spread */}
      {widgets.geoMap && (
        <div className="rounded-md border border-border bg-surface p-5 space-y-4">
          <h2 className="font-display text-lg font-semibold text-text">Global Audience Geographic Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Regional percentages */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center text-xs">
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] text-text-faint uppercase block">United States</span>
                <span className="text-lg font-bold text-cyan">42%</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] text-text-faint uppercase block">United Kingdom</span>
                <span className="text-lg font-bold text-cyan">18%</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] text-text-faint uppercase block">Germany</span>
                <span className="text-lg font-bold text-cyan">12%</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border">
                <span className="text-[10px] text-text-faint uppercase block">Japan</span>
                <span className="text-lg font-bold text-cyan">9%</span>
              </div>
              <div className="p-3 rounded-sm bg-surface-2 border border-border col-span-2 sm:col-span-1">
                <span className="text-[10px] text-text-faint uppercase block">Rest of World</span>
                <span className="text-lg font-bold text-pink">19%</span>
              </div>
            </div>

            {/* Demographics Age Bar */}
            <div className="p-4 rounded-sm bg-surface-2 border border-border space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-text-faint block">Demographic Spread</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>18–24 Yrs</span>
                  <span className="text-pink font-semibold">48%</span>
                </div>
                <div className="flex justify-between">
                  <span>25–34 Yrs</span>
                  <span className="text-cyan font-semibold">38%</span>
                </div>
                <div className="flex justify-between">
                  <span>35+ Yrs</span>
                  <span className="text-text-muted">14%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
