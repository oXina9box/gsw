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
import {
  CORE_DEPARTMENTS_CONFIG,
  PRECONFIGURED_LANES,
} from "@/lib/studio/departments";

export const metadata = { title: "Departments & Lanes · Builder" };

type Department = { id: string; name: string; display_order: number };
type Lane = {
  id: string;
  department_id: string;
  name: string;
  collaboration_mode: "forward" | "round_table";
  pass_order: number[];
  pass_cycles: number;
};
type Agent = {
  id: string;
  lane_id: string;
  name: string;
  agent_type: string;
  recommended_tier: "free" | "mid" | "quality";
  model_tier_override: "free" | "mid" | "quality" | null;
  protected_config?: boolean;
};
type AgentFile = {
  agent_id: string;
  role: string;
  soul: string;
  jobdescription: string;
  skills: string;
  memory: string;
  user_content: string;
};

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; dept?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: departments }, { data: lanes }, { data: agents }, { data: files }, { data: onboardingProfile }] =
    await Promise.all([
      supabase.from("departments").select("id, name, display_order").order("display_order").order("name"),
      supabase.from("lanes").select("id, department_id, name, collaboration_mode, pass_order, pass_cycles").order("name"),
      supabase.from("agents").select("id, lane_id, name, agent_type, recommended_tier, model_tier_override, protected_config").order("name"),
      supabase.from("agent_files").select("agent_id, role, soul, jobdescription, skills, memory, user_content"),
      supabase.from("onboarding_profiles").select("commercial_choice").maybeSingle(),
    ]);

  const params = await searchParams;
  const commercial = (onboardingProfile?.commercial_choice ?? {}) as { plan?: string; byok_enabled?: boolean };
  const isByokUser = commercial.plan === "content-byok" || commercial.plan === "creator-byok" || commercial.plan === "self-host" || commercial.plan === "byok";

  const departmentList = (departments as Department[] | null) ?? [];
  const laneList = (lanes as Lane[] | null) ?? [];
  const agentList = (agents as Agent[] | null) ?? [];
  const fileList = (files as AgentFile[] | null) ?? [];

  const byDepartment = (departmentId: string) =>
    laneList.filter((lane) => lane.department_id === departmentId);
  const byLane = (laneId: string) =>
    agentList.filter((agent) => agent.lane_id === laneId);
  const fileFor = (agentId: string): AgentFile =>
    fileList.find((file) => file.agent_id === agentId) ?? {
      agent_id: agentId,
      role: "",
      soul: "",
      jobdescription: "",
      skills: "",
      memory: "",
      user_content: "",
    };

  return (
    <section className="product-page shell" data-archetype="B2-B">
      <header className="page-header mb-6">
        <p className="kicker">Studio Workspace / Architecture</p>
        <h1>Departmental Setup &amp; Lanes</h1>
        <p className="lede">
          Configure working teams across Marketing, Socials, Development, and Production.{" "}
          {isByokUser
            ? "BYOK Mode: Build custom lanes and collaboration topologies."
            : "Pro Mode: Select preconfigured departmental lanes or author custom lanes."}
        </p>
      </header>

      {params.error && (
        <p className="form-error" role="alert">
          Unable to save that builder record. Please check your inputs.
        </p>
      )}

      {/* 4 Core Department Sections */}
      {CORE_DEPARTMENTS_CONFIG.map((coreDept) => {
        // Find or fallback department in DB
        const matchingDbDepts = departmentList.filter(
          (d) => d.name.toLowerCase() === coreDept.name.toLowerCase() || d.display_order === coreDept.displayOrder
        );
        const primaryDept = matchingDbDepts[0] ?? { id: `dept-${coreDept.slug}`, name: coreDept.name, display_order: coreDept.displayOrder };
        const deptLanes = matchingDbDepts.flatMap((d) => byDepartment(d.id));
        const preconfiguredForDept = PRECONFIGURED_LANES.filter(
          (lane) => lane.department === coreDept.name
        );

        return (
          <section className="builder-section dept-section" key={coreDept.name}>
            <div className="section-head row-between">
              <div>
                <h2>
                  <span className="channel-tag mr-2">0{coreDept.displayOrder}</span>
                  {coreDept.name}
                </h2>
                <p className="muted">{coreDept.description}</p>
              </div>

              {/* Add Lane Form */}
              <form action={createLane} className="inline-form row-wrap">
                <input type="hidden" name="department_id" value={primaryDept.id} />
                <label className="field-inline">
                  <input
                    name="name"
                    placeholder={`New ${coreDept.name} lane...`}
                    maxLength={120}
                    required
                    className="input-compact"
                  />
                </label>
                <button className="button button-outline button-small" type="submit">
                  + Add Lane
                </button>
              </form>
            </div>

            {/* Pro User Preconfigured Quick-Select Rail */}
            {!isByokUser && preconfiguredForDept.length > 0 && (
              <div className="preconfigured-lane-rail list-card mt-4 mb-4">
                <div className="row-between mb-2">
                  <span className="rail-label">
                    Preconfigured Pro Lanes:
                  </span>
                </div>
                <div className="row-wrap">
                  {preconfiguredForDept.map((preLane) => {
                    const alreadyAdded = deptLanes.some((l) => l.name.toLowerCase() === preLane.name.toLowerCase());
                    return (
                      <form action={createLane} key={preLane.id} className="inline">
                        <input type="hidden" name="department_id" value={primaryDept.id} />
                        <input type="hidden" name="name" value={preLane.name} />
                        <button
                          type="submit"
                          disabled={alreadyAdded}
                          className={`button button-small ${alreadyAdded ? "button-outline is-active" : "button-secondary"}`}
                          title={preLane.description}
                        >
                          {alreadyAdded ? `✓ ${preLane.name}` : `+ ${preLane.name}`}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Lanes List */}
            {deptLanes.length === 0 ? (
              <p className="muted py-4">
                No active lanes in {coreDept.name}. {isByokUser ? "Build a custom lane above." : "Select a preconfigured lane above or create a new one."}
              </p>
            ) : (
              deptLanes.map((lane) => (
                <div className="panel mt-4 radius-sm" key={lane.id}>
                  <div className="section-head row-between mb-4">
                    <div className="row-wrap">
                      <h3>{lane.name}</h3>
                      <span className="tier-badge">
                        {lane.collaboration_mode === "round_table" ? "Round Table" : "Forward"}
                      </span>
                    </div>

                    {/* Collaboration Mode Form */}
                    <form action={updateLaneCollaboration} className="inline-form row-wrap">
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <label className="field-inline">
                        Mode:
                        <select name="collaboration_mode" defaultValue={lane.collaboration_mode ?? "forward"} className="ml-1">
                          <option value="forward">Forward</option>
                          <option value="round_table">Round Table</option>
                        </select>
                      </label>
                      <label className="field-inline">
                        Cycles:
                        <input name="pass_cycles" type="number" min="1" max="20" defaultValue={lane.pass_cycles ?? 1} className="cycles-input ml-1" />
                      </label>
                      <button className="button button-outline button-small" type="submit">
                        Save Mode
                      </button>
                    </form>

                    {/* Add Agent Form */}
                    <form action={createAgent} className="inline-form row-wrap">
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <input name="name" placeholder="Agent title..." maxLength={120} required className="input-compact" />
                      <select name="agent_type" defaultValue="worker" aria-label="Agent type">
                        <option value="worker">Worker</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                      <button className="button button-outline button-small" type="submit">
                        + Agent
                      </button>
                    </form>

                    {/* Delete Lane Form */}
                    <form action={deleteLane} className="inline-form">
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <label className="check-row text-xs">
                        <input name="confirm_delete" type="checkbox" required />
                        Delete
                      </label>
                      <button className="button button-outline button-small ml-1" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>

                  {/* Agents in this lane */}
                  <div className="lane-agents-list">
                    {byLane(lane.id).length === 0 ? (
                      <p className="muted text-sm">No agents assigned to this lane yet.</p>
                    ) : (
                      byLane(lane.id).map((agent) => (
                        <article
                          className="agent-row list-card mb-3"
                          key={agent.id}
                        >
                          <div className="row-between mb-2">
                            <div>
                              <strong>{agent.name}</strong>
                              <span className="muted ml-2 text-sm">
                                {agent.agent_type} · recommended {agent.recommended_tier ?? "free"}
                              </span>
                            </div>

                            {/* Model Tier Form */}
                            <form action={updateAgentModel} className="inline-form row-wrap">
                              <input type="hidden" name="agent_id" value={agent.id} />
                              <label className="field-inline">
                                Tier:
                                <select name="recommended_tier" defaultValue={agent.recommended_tier ?? "free"} className="ml-1">
                                  <option value="free">Free</option>
                                  <option value="mid">Mid</option>
                                  <option value="quality">Best</option>
                                </select>
                              </label>
                              <button className="button button-outline button-small" type="submit">
                                Save Tier
                              </button>
                            </form>

                            {/* Delete Agent Form */}
                            <form action={deleteAgent} className="inline-form">
                              <input type="hidden" name="agent_id" value={agent.id} />
                              <label className="check-row text-xs">
                                <input name="confirm_delete" type="checkbox" required />
                              </label>
                              <button className="button button-outline button-small" type="submit" aria-label={`Remove ${agent.name}`}>
                                Remove
                              </button>
                            </form>
                          </div>

                          {/* 6-File Agent Editor with IP Protection */}
                          <AgentEditor
                            file={fileFor(agent.id)}
                            action={updateAgentFiles}
                            isProtected={Boolean(agent.protected_config)}
                          />
                        </article>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        );
      })}
    </section>
  );
}
