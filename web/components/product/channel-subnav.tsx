"use client";

import type { ChangeEvent } from "react";

export type ChannelTab =
  | "dashboard"
  | "staffing"
  | "marketing"
  | "social"
  | "assets"
  | "production";

export type ChannelSubnavItem = Readonly<{
  id: string;
  label: string;
}>;

export type ChannelSubnavGroup = Readonly<{
  label?: string;
  items: readonly ChannelSubnavItem[];
}>;

export type ChannelSubnavProps = Readonly<{
  activeTab: ChannelTab;
  activeView?: string;
  groups?: readonly ChannelSubnavGroup[];
  onViewChange?: (viewId: string) => void;
}>;

export function ChannelSubnav({
  activeTab,
  activeView,
  groups = [],
  onViewChange,
}: ChannelSubnavProps) {
  if (activeTab === "dashboard") {
    return null;
  }

  // Find label for current active view
  let activeLabel = activeView ?? "";
  for (const group of groups) {
    const match = group.items.find((item) => item.id === activeView);
    if (match) {
      activeLabel = match.label;
      break;
    }
  }

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onViewChange?.(e.target.value);
  };

  return (
    <div className="mb-6 w-full rounded-md border border-border bg-surface p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="channel-third-tier-view-select"
          className="font-mono text-xs font-semibold uppercase tracking-wider text-text-muted"
        >
          View:{" "}
          <span className="text-text font-sans font-medium text-sm">
            {activeLabel}
          </span>
        </label>
        <div className="w-full sm:w-80">
          <select
            id="channel-third-tier-view-select"
            aria-label="Page view"
            value={activeView}
            onChange={handleChange}
            className="w-full rounded border border-border bg-bg px-3 py-2 font-mono text-sm text-text transition-colors focus:border-cyan focus:outline-hidden"
          >
            {groups.map((group, groupIdx) => {
              if (group.label) {
                return (
                  <optgroup key={`${group.label}-${groupIdx}`} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }
              return group.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ));
            })}
          </select>
        </div>
      </div>
    </div>
  );
}
