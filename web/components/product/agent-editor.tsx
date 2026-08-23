import type { updateAgentFiles } from "@/app/(product)/actions";

type AgentFile = { agent_id: string; role: string; soul: string; jobdescription: string; skills: string; memory: string; user_content: string };

export function AgentEditor({ file, action }: { file: AgentFile; action: typeof updateAgentFiles }) {
  const fields = ["role", "soul", "jobdescription", "skills", "memory", "user_content"] as const;
  return <details className="agent-editor"><summary>Edit agent files</summary><form action={action} className="file-form"><input type="hidden" name="agent_id" value={file.agent_id} />{fields.map((field) => <label key={field}>{field === "user_content" ? "user.md" : `${field}.md`}<textarea name={field} rows={field === "jobdescription" ? 6 : 3} defaultValue={file[field]} /></label>)}<button className="button button-primary" type="submit">Save files</button></form></details>;
}
