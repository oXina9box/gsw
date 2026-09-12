"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { DEPARTMENTS } from "@/lib/studio/domain";

type ChannelData = Readonly<{
  id: string;
  name: string;
  status: string | null;
  audience: string | null;
  voice: string | null;
  cadence: string | null;
  pillars: string[] | null;
}>;

type ProductionItem = Readonly<{
  id: string;
  title: string;
  status: string;
  current_step: number | null;
  step_count: number | null;
  run_mode: string;
  scheduled_at: string | null;
  updated_at: string;
}>;

type Props = Readonly<{ channel: ChannelData; productions: readonly ProductionItem[] }>;

function ScheduledTime({ value }: { value: string }) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return <span>Schedule unavailable</span>;
  return <time dateTime={value}>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date)} UTC</time>;
}

export function ChannelDashboardClient({ channel, productions }: Props) {
  const [widgets, setWidgets] = useState({ summary: true, productions: true, schedule: true, directives: true });
  const scheduled = productions.filter((item) => item.scheduled_at).toSorted((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));
  const running = productions.filter((item) => ["active", "running", "in_flight"].includes(item.status)).length;
  const completed = productions.filter((item) => ["completed", "published"].includes(item.status)).length;
  const base = `/app/channels/${channel.id}`;

  return (
    <div className="space-y-4">
      <details className="w-fit max-w-full rounded-sm border border-border bg-surface px-3 py-2">
        <summary className="cursor-pointer text-sm text-text-muted">Customize dashboard</summary>
        <div className="flex flex-wrap gap-4 pt-3">
          {Object.entries(widgets).map(([key, visible]) => (
            <label key={key} className="flex items-center gap-2 text-sm capitalize">
              <input type="checkbox" checked={visible} onChange={() => setWidgets((previous) => ({ ...previous, [key]: !previous[key as keyof typeof previous] }))} />
              {key}
            </label>
          ))}
        </div>
      </details>

      {widgets.summary && (
        <dl className="grid grid-cols-3 gap-3">
          {[["Productions", productions.length], ["Active", running], ["Completed", completed]].map(([label, value]) => (
            <div key={label} className="rounded-sm border border-border bg-surface p-3">
              <dt className="text-xs text-text-muted">{label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-cyan">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {widgets.productions && (
        <section className="rounded-sm border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Productions</h2>
            <Link href={`${base}/production`} className="text-sm text-cyan hover:underline">Open production</Link>
          </div>
          {productions.length ? (
            <ul className="mt-3 divide-y divide-border">
              {productions.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/app/productions/${item.id}`} className="font-medium hover:underline">{item.title}</Link>
                    <p className="mt-1 text-xs text-text-muted">
                      {item.run_mode} · {item.current_step !== null ? (DEPARTMENTS[item.current_step] ?? "Stage unavailable") : "Not started"}
                    </p>
                  </div>
                  <FlowbiteBadge color={["completed", "published"].includes(item.status) ? "lime" : "cyan"} size="sm">{item.status}</FlowbiteBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No productions yet. <Link href={`${base}/production`} className="text-cyan hover:underline">Create your first production</Link>.</p>
          )}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
        {widgets.schedule && (
          <section className="rounded-sm border border-border bg-surface p-4">
            <h2 className="font-display text-lg font-semibold">Schedule</h2>
            {scheduled.length ? (
              <ul className="mt-3 divide-y divide-border">
                {scheduled.map((item) => (
                  <li key={item.id} className="space-y-1 py-2">
                    <Link href={`/app/productions/${item.id}`} className="text-sm hover:underline">{item.title}</Link>
                    <p className="text-xs text-text-muted"><ScheduledTime value={item.scheduled_at!} /></p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-text-muted">No scheduled productions.</p>}
          </section>
        )}
        {widgets.directives && (
          <section className="rounded-sm border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Channel direction</h2>
              <Link href={`${base}/marketing`} className="text-sm text-cyan hover:underline">Edit</Link>
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {[["Audience", channel.audience], ["Voice", channel.voice], ["Cadence", channel.cadence], ["Pillars", channel.pillars?.join(" · ")]].map(([label, value]) => (
                <div key={label}><dt className="text-xs text-text-muted">{label}</dt><dd className="mt-1 text-sm">{value || "Not set"}</dd></div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
