"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { setChannelStaffAction } from "@/app/(product)/actions";

type AgentItem = {
  id: string;
  name: string;
  capability: string | null;
  model: string | null;
  lanes: {
    id?: string;
    name?: string;
    departments?: { id?: string; name?: string } | null;
  } | null;
};

type ChannelStaffingClientProps = Readonly<{
  channelId: string;
  channelName: string;
  agents: AgentItem[];
  assignedAgentIds: string[];
}>;

const CORE_DEPARTMENTS = ["Marketing", "Creative", "Production", "Operations"] as const;

export function ChannelStaffingClient({
  channelId,
  channelName,
  agents,
  assignedAgentIds,
}: ChannelStaffingClientProps) {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "assigned" | "available">("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const assignedSet = new Set(assignedAgentIds);

  // Filter agents based on tab, department, and search query
  const filteredAgents = agents.filter((agent) => {
    const isAssigned = assignedSet.has(agent.id);

    if (filterTab === "assigned" && !isAssigned) return false;
    if (filterTab === "available" && isAssigned) return false;

    const lane = agent.lanes;
    const deptName = lane?.departments?.name ?? "General";
    if (selectedDept !== "all" && deptName.toLowerCase() !== selectedDept.toLowerCase()) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q);
      const matchCap = (agent.capability ?? "").toLowerCase().includes(q);
      const matchModel = (agent.model ?? "").toLowerCase().includes(q);
      if (!matchName && !matchCap && !matchModel) return false;
    }

    return true;
  });

  // Calculate department coverage
  const deptCounts = CORE_DEPARTMENTS.map((dept) => {
    const assignedInDept = agents.filter((a) => {
      const d = a.lanes?.departments?.name ?? "";
      return d.toLowerCase() === dept.toLowerCase() && assignedSet.has(a.id);
    }).length;
    return { name: dept, count: assignedInDept };
  });

  const hiredList = filteredAgents.filter((a) => assignedSet.has(a.id));
  const availableList = filteredAgents.filter((a) => !assignedSet.has(a.id));

  return (
    <div className="space-y-6">
      {/* Department Quota & Coverage Bar */}
      <div className="rounded-md border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <h2 className="font-display text-sm font-semibold text-text uppercase tracking-wide">
            Department Quota &amp; Coverage Bar
          </h2>
          <span className="font-mono text-xs text-text-muted">
            {assignedSet.size} Active Specialists Assigned
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {deptCounts.map(({ name, count }) => {
            const hasStaff = count > 0;
            return (
              <div
                key={name}
                className="p-3 rounded-sm bg-surface-2 border border-border flex items-center justify-between"
              >
                <div>
                  <span className="text-text font-medium block">{name}</span>
                  <span className="text-[10px] text-text-faint">{count} Staffed</span>
                </div>
                <FlowbiteBadge color={hasStaff ? "lime" : "amber"} size="sm">
                  {hasStaff ? "Locked" : "Vacant"}
                </FlowbiteBadge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-md border border-border bg-surface-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 font-mono text-xs rounded-sm transition-colors ${
              filterTab === "all"
                ? "bg-pink text-white font-semibold"
                : "text-text-muted hover:text-text hover:bg-surface"
            }`}
          >
            All Staff ({agents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("assigned")}
            className={`px-3 py-1 font-mono text-xs rounded-sm transition-colors ${
              filterTab === "assigned"
                ? "bg-pink text-white font-semibold"
                : "text-text-muted hover:text-text hover:bg-surface"
            }`}
          >
            Hired / Assigned ({assignedSet.size})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("available")}
            className={`px-3 py-1 font-mono text-xs rounded-sm transition-colors ${
              filterTab === "available"
                ? "bg-pink text-white font-semibold"
                : "text-text-muted hover:text-text hover:bg-surface"
            }`}
          >
            Available to Hire ({agents.length - assignedSet.size})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-sm border border-border bg-surface px-2 py-1 font-mono text-xs text-text focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="all">All Departments</option>
            {CORE_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search specialist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-sm border border-border bg-surface px-3 py-1 font-mono text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        </div>
      </div>

      {/* Two-Tier Master Agent List */}
      {agents.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-8 text-center space-y-3">
          <h3 className="font-display text-lg font-semibold text-text">No Agents in Studio Yet</h3>
          <p className="font-body text-xs text-text-muted max-w-md mx-auto">
            Build your department lanes or hire foundational specialists from the global catalog to staff {channelName}.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/app/builder" className="button button-primary text-xs">
              Open Departmental Builder
            </Link>
            <Link href="/app/agents" className="button button-secondary text-xs">
              Browse Agent Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Hired / Assigned Specialists */}
          {(filterTab === "all" || filterTab === "assigned") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-display text-base font-semibold text-text">
                  Hired &amp; Active Channel Staff ({hiredList.length})
                </h3>
                <span className="font-mono text-xs text-text-faint">
                  Executing jobs and prompt bibles for {channelName}
                </span>
              </div>

              {hiredList.length === 0 ? (
                <div className="p-6 rounded-md border border-dashed border-border bg-surface text-center font-mono text-xs text-text-muted">
                  No specialists currently assigned matching filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hiredList.map((agent) => {
                    const lane = agent.lanes;
                    const deptName = lane?.departments?.name ?? "General";
                    const laneName = lane?.name ?? "Unassigned lane";

                    return (
                      <div
                        key={agent.id}
                        className="rounded-md border border-lime/40 bg-surface p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase text-text-faint">
                              {deptName} · {laneName}
                            </span>
                            <FlowbiteBadge color="lime" size="sm">
                              Assigned
                            </FlowbiteBadge>
                          </div>
                          <h4 className="font-display text-base font-semibold text-text">{agent.name}</h4>
                          <p className="font-body text-xs text-text-muted">{agent.capability ?? "Specialist"}</p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="font-mono text-[10px] text-cyan">{agent.model ?? "default model"}</span>
                          <form action={setChannelStaffAction}>
                            <input type="hidden" name="channel_id" value={channelId} />
                            <input type="hidden" name="agent_id" value={agent.id} />
                            <input type="hidden" name="assign" value="false" />
                            <button
                              type="submit"
                              className="font-mono text-xs px-2.5 py-1 rounded-sm border border-red/40 text-red hover:bg-red/10 transition-colors"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Talent Pool — Available to Hire / Assign */}
          {(filterTab === "all" || filterTab === "available") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-display text-base font-semibold text-text">
                  Talent Pool — Available to Staff ({availableList.length})
                </h3>
                <span className="font-mono text-xs text-text-faint">
                  Active studio agents ready to be attached to this channel
                </span>
              </div>

              {availableList.length === 0 ? (
                <div className="p-6 rounded-md border border-dashed border-border bg-surface text-center font-mono text-xs text-text-muted">
                  All eligible studio agents are currently assigned to this channel.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {availableList.map((agent) => {
                    const lane = agent.lanes;
                    const deptName = lane?.departments?.name ?? "General";
                    const laneName = lane?.name ?? "Unassigned lane";

                    return (
                      <div
                        key={agent.id}
                        className="rounded-md border border-border bg-surface p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase text-text-faint">
                              {deptName} · {laneName}
                            </span>
                            <FlowbiteBadge color="cyan" size="sm">
                              Available
                            </FlowbiteBadge>
                          </div>
                          <h4 className="font-display text-base font-semibold text-text">{agent.name}</h4>
                          <p className="font-body text-xs text-text-muted">{agent.capability ?? "Specialist"}</p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="font-mono text-[10px] text-text-faint">
                            {agent.model ?? "default model"}
                          </span>
                          <form action={setChannelStaffAction}>
                            <input type="hidden" name="channel_id" value={channelId} />
                            <input type="hidden" name="agent_id" value={agent.id} />
                            <input type="hidden" name="assign" value="true" />
                            <button
                              type="submit"
                              className="font-mono text-xs px-2.5 py-1 rounded-sm bg-pink hover:bg-pink-hover text-white transition-colors"
                            >
                              Assign to channel
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Links to Acquire / Build Specialists */}
          <div className="p-4 rounded-md border border-border bg-surface-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-display text-sm font-semibold text-text block">
                Need more specialized production lanes or novel agent personas?
              </span>
              <p className="font-body text-xs text-text-muted">
                Configure custom 6-file agent souls, BYOK model routing, and round-table handoff rules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/app/builder" className="button button-secondary text-xs">
                Departmental Builder
              </Link>
              <Link href="/app/agents" className="button button-primary text-xs">
                Agent Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
