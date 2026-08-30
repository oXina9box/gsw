"use client";

import { useState } from "react";
import { updateAgentFiles, updateAgentModel, updateLaneCollaboration } from "@/app/(product)/actions";

export type InspectorAgent = {
  id: string;
  name: string;
  lane_id: string;
  agent_type?: string;
  status?: string | null;
  protected_config?: boolean | null;
  recommended_tier?: "free" | "mid" | "quality" | null;
  model_tier_override?: "free" | "mid" | "quality" | null;
};

export type InspectorLane = { id: string; name: string; collaboration_mode?: "forward" | "round_table" | null; pass_order?: number[] | null; pass_cycles?: number | null };
export type InspectorFiles = { agent_id: string; role: string; soul: string; jobdescription: string; skills: string; memory: string; user_content: string };

const fileFields = ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const;
const fileLabels: Record<(typeof fileFields)[number], string> = { role: "role.md", soul: "soul.md", jobdescription: "jobdescription.md", skills: "skills.md", memory: "memory.md", user_content: "user.md" };

type Props = { agent: (InspectorAgent & { model?: string | null }) | null; lane?: InspectorLane | null; files?: InspectorFiles | null; modelTiers?: readonly ("free" | "mid" | "quality")[]; handoffDocuments?: readonly { id: string; title: string; status?: string; source?: string }[] };

export function AgentNodeInspector({ agent, lane, files, modelTiers = ["free", "mid", "quality"], handoffDocuments = [] }: Props) {
  const [tab, setTab] = useState<"settings" | "files" | "context">("settings");
  if (!agent) return <aside className="panel agent-inspector" aria-label="Agent inspector"><p className="muted">Select agent node to inspect.</p></aside>;
  const currentFiles = files ?? { agent_id: agent.id, role: "", soul: "", jobdescription: "", skills: "", memory: "", user_content: "" };
  const currentLane = lane ?? { id: agent.lane_id, name: "Current lane", collaboration_mode: "forward" as const, pass_order: [], pass_cycles: 1 };
  const returnTo = "/app/orchestration";

  return <aside className="panel agent-inspector" aria-label={`Inspector for ${agent.name}`}>
    <div className="section-head"><div><span className="eyebrow">Agent node</span><h2>{agent.name}</h2><p className="muted">{agent.agent_type ?? "worker"} · {currentLane.name}</p></div><span className={`status-mark ${agent.status === "blocked" ? "amber" : agent.status === "running" ? "cyan" : agent.status === "complete" ? "lime" : "pink"}`}>{agent.status ?? "ready"}</span></div>
    <div className="inspector-tabs" role="tablist" aria-label="Inspector sections">
      {(["settings", "files", "context"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "button button-primary" : "button button-outline"} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
    </div>
    {tab === "settings" && <div className="inspector-section">
      <form key={agent.id} action={updateAgentModel} className="stack-form">
        <input type="hidden" name="agent_id" value={agent.id} />
        <input type="hidden" name="return_to" value={returnTo} />
        <label>Recommended model
          <select name="recommended_tier" defaultValue={agent.recommended_tier ?? "free"}>
            {modelTiers.map((tier) => <option key={tier} value={tier}>{tier === "quality" ? "Best" : `${tier[0].toUpperCase()}${tier.slice(1)}`}</option>)}
          </select>
        </label>
        <label>Override
          <select name="model_tier_override" defaultValue={agent.model_tier_override ?? ""}>
            <option value="">Use recommendation</option>
            {modelTiers.map((tier) => <option key={tier} value={tier}>{`${tier[0].toUpperCase()}${tier.slice(1)}`}</option>)}
          </select>
        </label>
        <button className="button button-primary" type="submit">Save model</button>
      </form>
      <form key={currentLane.id} action={updateLaneCollaboration} className="stack-form"><input type="hidden" name="lane_id" value={currentLane.id} /><input type="hidden" name="return_to" value={returnTo} /><label>Lane collaboration<select name="collaboration_mode" defaultValue={currentLane.collaboration_mode ?? "forward"}><option value="forward">Ordered handoff</option><option value="round_table">Group / round table</option></select></label><label>Pass order<input name="pass_order" defaultValue={(currentLane.pass_order ?? []).join(",")} placeholder="0,1,2" /></label><label>Pass cycles<input name="pass_cycles" type="number" min={1} max={20} defaultValue={currentLane.pass_cycles ?? 1} /></label><button className="button button-outline" type="submit">Save lane settings</button></form>
    </div>}
    {tab === "files" && (agent.protected_config ? <div className="inspector-protected" role="status"><strong>Protected agent configuration</strong><p className="muted">Proprietary prompt files stay sealed on the server. This node can still run with its configured model.</p></div> : <form key={agent.id} action={updateAgentFiles} className="stack-form"><input type="hidden" name="agent_id" value={currentFiles.agent_id} /><input type="hidden" name="return_to" value={returnTo} />{fileFields.map((field) => <label key={field}>{fileLabels[field]}<textarea name={field} rows={field === "jobdescription" ? 5 : 3} defaultValue={currentFiles[field]} /></label>)}<button className="button button-primary" type="submit">Save agent files</button></form>)}
    {tab === "context" && <div className="inspector-section"><h3>Previous handoffs</h3>{handoffDocuments.length ? <ul className="event-list">{handoffDocuments.map((doc) => <li key={doc.id}><strong>{doc.title}</strong><span>{doc.source ?? "Previous agent"}</span><span className="muted">{doc.status ?? "available"}</span></li>)}</ul> : <p className="muted">No documents handed off yet.</p>}<details><summary>Context contract</summary><p className="muted">Outputs from prior nodes become read-only input for this agent. New output is attached to next handoff.</p></details></div>}
  </aside>;
}
