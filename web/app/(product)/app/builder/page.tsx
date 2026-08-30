import { createClient } from "@/lib/supabase/server";
import {
  createAgent,
  createLane,
  deleteAgent,
  deleteLane,
  updateAgentFiles,
  updateAgentModel,
  updateLaneCollaboration,
} from "@/app/(product)/actions";
import { AgentEditor } from "@/components/product/agent-editor";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Departments & Lanes · Builder" };


export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; dept?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [
    { data: departments },
    { data: lanes },
    { data: agents },
    { data: agentFiles },
  ] = await Promise.all([
    supabase.from("departments").select("id, name, display_order").order("display_order"),
    supabase.from("lanes").select("id, department_id, name, collaboration_mode, pass_order, pass_cycles"),
    supabase.from("agents").select("id, lane_id, name, agent_type, recommended_tier, model_tier_override, protected_config"),
    supabase.from("agent_files").select("agent_id, role, soul, jobdescription, skills, memory, user_content"),
  ]);

  const activeDeptId = params.dept || departments?.[0]?.id;
  const activeDept = departments?.find((d) => d.id === activeDeptId) || departments?.[0];

  const deptLanes = (lanes || []).filter((l) => l.department_id === activeDept?.id);

  return (
    <section className="product-page shell" data-archetype="B2-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Studio Builder.
        </h1>
        <p className="text-base text-text-muted font-body">
          Configure 13 studio departments, collaboration topologies (forward vs round table), model tiers, and 6-file agent contracts.
        </p>
      </div>

      {params.error && (
        <p className="form-error mb-6" role="alert">
          {params.error === "lane"
            ? "Lane could not be saved."
            : params.error === "agent"
            ? "Agent operation failed."
            : "Builder update failed."}
        </p>
      )}

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-border mb-8">
        {(departments || []).map((dept) => {
          const isActive = dept.id === activeDept?.id;

          return (
            <a
              key={dept.id}
              href={`/app/builder?dept=${dept.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-mono whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? "bg-surface-3 text-text font-semibold border-b-2 border-pink"
                  : "text-text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              <span>{String(dept.display_order).padStart(2, "0")}</span>
              <span>{dept.name}</span>
            </a>
          );
        })}
      </div>

      {activeDept && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border bg-surface-2 rounded-md">
            <div>
              <h2 className="font-display text-xl font-bold text-text">
                {activeDept.name} Department
              </h2>
              <p className="text-xs text-text-muted font-body mt-1">
                Lanes run deterministic forward handoffs or circular round-table reviews.
              </p>
            </div>

            <form action={createLane} className="inline-form">
              <input type="hidden" name="department_id" value={activeDept.id} />
              <input
                name="name"
                placeholder="New lane name"
                required
                className="input text-xs"
              />
              <button className="button button-primary text-xs" type="submit">
                Add Lane
              </button>
            </form>
          </div>

          {/* Lanes list */}
          <div className="space-y-6">
            {deptLanes.map((lane) => {
              const laneAgents = (agents || []).filter((a) => a.lane_id === lane.id);

              return (
                <PrelineCard
                  key={lane.id}
                  kicker={`Lane: ${lane.collaboration_mode}`}
                  title={lane.name}
                  badge={
                    <FlowbiteBadge color={lane.collaboration_mode === "forward" ? "cyan" : "pink"} size="sm">
                      {lane.collaboration_mode}
                    </FlowbiteBadge>
                  }
                  action={
                    <form action={deleteLane}>
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <input type="hidden" name="department_id" value={activeDept.id} />
                      <button className="text-red hover:underline text-xs font-mono" type="submit">
                        Delete lane
                      </button>
                    </form>
                  }
                >
                  <div className="space-y-6">
                    {/* Collaboration topology selector */}
                    <form action={updateLaneCollaboration} className="inline-form p-3 border border-border-2 bg-surface-2 rounded-sm gap-4">
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <input type="hidden" name="department_id" value={activeDept.id} />
                      <label className="text-xs font-mono text-text-muted">
                        Mode:
                        <select name="collaboration_mode" defaultValue={lane.collaboration_mode} className="ml-2 bg-bg border border-border rounded-sm px-2 py-1 text-text">
                          <option value="forward">Forward Handoff</option>
                          <option value="round_table">Round Table</option>
                        </select>
                      </label>
                      <label className="text-xs font-mono text-text-muted">
                        Cycles:
                        <input
                          type="number"
                          name="pass_cycles"
                          defaultValue={lane.pass_cycles}
                          min={1}
                          max={5}
                          className="ml-2 w-16 bg-bg border border-border rounded-sm px-2 py-1 text-text"
                        />
                      </label>
                      <button className="button button-outline text-xs" type="submit">
                        Update Topology
                      </button>
                    </form>

                    {/* Agents assigned to this lane */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs text-text-faint uppercase tracking-wider">
                          Assigned Agents ({laneAgents.length})
                        </h4>
                        <form action={createAgent} className="inline-form gap-2">
                          <input type="hidden" name="lane_id" value={lane.id} />
                          <input type="hidden" name="department_id" value={activeDept.id} />
                          <input name="name" placeholder="Agent name" required className="input text-xs py-1" />
                          <button className="button button-outline text-xs py-1" type="submit">
                            + Add Agent
                          </button>
                        </form>
                      </div>

                      {laneAgents.length === 0 ? (
                        <p className="text-xs text-text-muted font-body italic">
                          No agents assigned to this lane yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {laneAgents.map((agent) => {
                            const files = (agentFiles || []).find((f) => f.agent_id === agent.id);

                            return (
                              <div key={agent.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-hairline pb-3">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <strong className="font-display text-sm text-text font-semibold">
                                        {agent.name}
                                      </strong>
                                      {agent.protected_config && (
                                        <FlowbiteBadge color="pink" size="sm">
                                          IP Protected
                                        </FlowbiteBadge>
                                      )}
                                    </div>
                                    <span className="font-mono text-xs text-text-faint">
                                      Type: {agent.agent_type} · Recommended: {agent.recommended_tier}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <form action={updateAgentModel} className="inline-form gap-2">
                                      <input type="hidden" name="agent_id" value={agent.id} />
                                      <input type="hidden" name="department_id" value={activeDept.id} />
                                      <select
                                        name="model_tier_override"
                                        defaultValue={agent.model_tier_override || agent.recommended_tier}
                                        className="bg-bg border border-border text-xs rounded-sm px-2 py-1 text-text"
                                      >
                                        <option value="free">Free Tier</option>
                                        <option value="mid">Mid Tier</option>
                                        <option value="quality">Quality Tier</option>
                                      </select>
                                      <button className="button button-outline text-xs py-1" type="submit">
                                        Save Tier
                                      </button>
                                    </form>

                                    <form action={deleteAgent}>
                                      <input type="hidden" name="agent_id" value={agent.id} />
                                      <input type="hidden" name="department_id" value={activeDept.id} />
                                      <button className="text-red hover:underline text-xs font-mono" type="submit">
                                        Remove
                                      </button>
                                    </form>
                                  </div>
                                </div>

                                {/* 6-file Agent Contract Editor */}
                                <AgentEditor
                                  file={
                                    files || {
                                      agent_id: agent.id,
                                      role: "",
                                      soul: "",
                                      jobdescription: "",
                                      skills: "",
                                      memory: "",
                                      user_content: "",
                                    }
                                  }
                                  action={updateAgentFiles}
                                  isProtected={agent.protected_config}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </PrelineCard>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
