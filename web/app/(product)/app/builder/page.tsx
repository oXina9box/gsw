import { createClient } from "@/lib/supabase/server";
import { createAgent, createLane, deleteAgent, deleteLane, updateAgentFiles } from "@/app/(product)/actions";
import { AgentEditor } from "@/components/product/agent-editor";

export const metadata = { title: "Builder" };

type Department = { id: string; name: string; display_order: number };
type Lane = { id: string; department_id: string; name: string };
type Agent = { id: string; lane_id: string; name: string; agent_type: string };
type AgentFile = { agent_id: string; role: string; soul: string; jobdescription: string; skills: string; memory: string; user_content: string };

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const [{ data: departments }, { data: lanes }, { data: agents }, { data: files }] = await Promise.all([
    supabase.from("departments").select("id, name, display_order").order("display_order").order("name"),
    supabase.from("lanes").select("id, department_id, name").order("name"),
    supabase.from("agents").select("id, lane_id, name, agent_type").order("name"),
    supabase.from("agent_files").select("agent_id, role, soul, jobdescription, skills, memory, user_content"),
  ]);
  const params = await searchParams;
  const byDepartment = (departmentId: string) => (lanes as Lane[] | null)?.filter((lane) => lane.department_id === departmentId) ?? [];
  const byLane = (laneId: string) => (agents as Agent[] | null)?.filter((agent) => agent.lane_id === laneId) ?? [];
  const fileFor = (agentId: string): AgentFile => (files as AgentFile[] | null)?.find((file) => file.agent_id === agentId) ?? { agent_id: agentId, role: "", soul: "", jobdescription: "", skills: "", memory: "", user_content: "" };
  return <section className="product-page shell"><h1>Lanes & agents</h1>{params.error && <p className="form-error" role="alert">Unable to save that builder record.</p>}{(departments as Department[] | null)?.map((department) => <section className="builder-section" key={department.id}><div className="section-head"><h2>{department.name}</h2><form action={createLane} className="inline-form"><input type="hidden" name="department_id" value={department.id} /><label>New lane<input name="name" placeholder="Script writing" maxLength={120} required /></label><button className="button button-outline" type="submit">Add lane</button></form></div>{byDepartment(department.id).map((lane) => <div className="panel" key={lane.id}><div className="section-head"><h3>{lane.name}</h3><form action={createAgent} className="inline-form"><input type="hidden" name="lane_id" value={lane.id} /><label>New agent<input name="name" placeholder="Prompt engineer" maxLength={120} required /></label><select name="agent_type" defaultValue="worker" aria-label="Agent type"><option value="worker">Worker</option><option value="supervisor">Supervisor</option></select><button className="button button-outline" type="submit">Add agent</button></form><form action={deleteLane} className="inline-form"><input type="hidden" name="lane_id" value={lane.id} /><label className="check-row"><input name="confirm_delete" type="checkbox" required />Delete lane and agents</label><button className="button button-outline" type="submit">Delete lane</button></form></div>{byLane(lane.id).length ? byLane(lane.id).map((agent) => <article className="agent-row" key={agent.id}><strong>{agent.name}</strong><span className="muted">{agent.agent_type}</span><AgentEditor file={fileFor(agent.id)} action={updateAgentFiles} /><form action={deleteAgent} className="inline-form"><input type="hidden" name="agent_id" value={agent.id} /><label className="check-row"><input name="confirm_delete" type="checkbox" required />Remove</label><button className="button button-outline" type="submit" aria-label={`Remove ${agent.name}`}>Remove</button></form></article>) : <p className="muted">No agents yet.</p>}</div>)}</section>)}</section>;
}
