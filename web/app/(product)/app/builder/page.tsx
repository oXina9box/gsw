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
      <header className="page-header" style={{ marginBottom: "var(--space-6)" }}>
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
          <section className="builder-section" key={coreDept.name} style={{ marginBottom: "var(--space-10)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
            <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2>
                  <span className="channel-tag" style={{ marginRight: "0.5rem" }}>0{coreDept.displayOrder}</span>
                  {coreDept.name}
                </h2>
                <p className="muted">{coreDept.description}</p>
              </div>

              {/* Add Lane Form */}
              <form action={createLane} className="inline-form" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="hidden" name="department_id" value={primaryDept.id} />
                <label style={{ margin: 0 }}>
                  <input
                    name="name"
                    placeholder={`New ${coreDept.name} lane...`}
                    maxLength={120}
                    required
                    style={{ padding: "0.4rem 0.6rem" }}
                  />
                </label>
                <button className="button button-outline button-small" type="submit">
                  + Add Lane
                </button>
              </form>
            </div>

            {/* Pro User Preconfigured Quick-Select Rail */}
            {!isByokUser && preconfiguredForDept.length > 0 && (
              <div className="preconfigured-lane-rail" style={{ margin: "var(--space-4) 0", padding: "0.75rem 1rem", background: "var(--color-surface-2)", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
                    Preconfigured Pro Lanes:
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {preconfiguredForDept.map((preLane) => {
                    const alreadyAdded = deptLanes.some((l) => l.name.toLowerCase() === preLane.name.toLowerCase());
                    return (
                      <form action={createLane} key={preLane.id} style={{ display: "inline" }}>
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
              <p className="muted" style={{ padding: "1rem 0" }}>
                No active lanes in {coreDept.name}. {isByokUser ? "Build a custom lane above." : "Select a preconfigured lane above or create a new one."}
              </p>
            ) : (
              deptLanes.map((lane) => (
                <div className="panel" key={lane.id} style={{ marginTop: "var(--space-4)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "1.25rem" }}>
                  <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <h3 style={{ margin: 0 }}>{lane.name}</h3>
                      <span className="tier-badge" style={{ fontSize: "0.75rem" }}>
                        {lane.collaboration_mode === "round_table" ? "Round Table" : "Forward"}
                      </span>
                    </div>

                    {/* Collaboration Mode Form */}
                    <form action={updateLaneCollaboration} className="inline-form" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <label style={{ margin: 0, fontSize: "0.85rem" }}>
                        Mode:
                        <select name="collaboration_mode" defaultValue={lane.collaboration_mode ?? "forward"} style={{ marginLeft: "0.25rem" }}>
                          <option value="forward">Forward</option>
                          <option value="round_table">Round Table</option>
                        </select>
                      </label>
                      <label style={{ margin: 0, fontSize: "0.85rem" }}>
                        Cycles:
                        <input name="pass_cycles" type="number" min="1" max="20" defaultValue={lane.pass_cycles ?? 1} style={{ width: "4rem", marginLeft: "0.25rem" }} />
                      </label>
                      <button className="button button-outline button-small" type="submit">
                        Save Mode
                      </button>
                    </form>

                    {/* Add Agent Form */}
                    <form action={createAgent} className="inline-form" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input type="hidden" name="lane_id" value={lane.id} />
                      <input name="name" placeholder="Agent title..." maxLength={120} required style={{ padding: "0.3rem 0.5rem" }} />
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
                      <label className="check-row" style={{ fontSize: "0.8rem", margin: 0 }}>
                        <input name="confirm_delete" type="checkbox" required />
                        Delete
                      </label>
                      <button className="button button-outline button-small" type="submit" style={{ marginLeft: "0.25rem" }}>
                        Remove
                      </button>
                    </form>
                  </div>

                  {/* Agents in this lane */}
                  <div className="lane-agents-list">
                    {byLane(lane.id).length === 0 ? (
                      <p className="muted" style={{ fontSize: "0.9rem" }}>No agents assigned to this lane yet.</p>
                    ) : (
                      byLane(lane.id).map((agent) => (
                        <article
                          className="agent-row"
                          key={agent.id}
                          style={{
                            padding: "1rem",
                            background: "var(--color-surface-1)",
                            borderRadius: "6px",
                            border: "1px solid var(--color-border)",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <div>
                              <strong>{agent.name}</strong>
                              <span className="muted" style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                                {agent.agent_type} · recommended {agent.recommended_tier ?? "free"}
                              </span>
                            </div>

                            {/* Model Tier Form */}
                            <form action={updateAgentModel} className="inline-form" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                              <input type="hidden" name="agent_id" value={agent.id} />
                              <label style={{ margin: 0, fontSize: "0.8rem" }}>
                                Tier:
                                <select name="recommended_tier" defaultValue={agent.recommended_tier ?? "free"} style={{ marginLeft: "0.25rem" }}>
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
                              <label className="check-row" style={{ fontSize: "0.8rem", margin: 0 }}>
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
