import type { updateAgentFiles } from "@/app/(product)/actions";
import { PROTECTED_IP_MESSAGE, PROTECTED_IP_EXPLANATION } from "@/lib/studio/agent-protection";

export type AgentFile = {
  agent_id: string;
  role: string;
  soul: string;
  jobdescription: string;
  skills: string;
  memory: string;
  user_content: string;
};

export function AgentEditor({
  file,
  action,
  isProtected = false,
}: {
  file: AgentFile;
  action?: typeof updateAgentFiles;
  isProtected?: boolean;
}) {
  const fields = [
    { key: "role", label: "role.md", hint: "Identity, authority level, and departmental scope." },
    { key: "soul", label: "soul.md", hint: "Voice, tone, personality, and aesthetic principles." },
    { key: "jobdescription", label: "jobdescription.md", hint: "Task boundaries, inputs, and deliverable schemas." },
    { key: "skills", label: "skills.md", hint: "Technical proficiencies and domain capabilities." },
    { key: "memory", label: "memory.md", hint: "Context retention rules, canon references, and past context." },
    { key: "user_content", label: "user_content.md (user.md)", hint: "Creator notes, custom directives, and studio rules." },
  ] as const;

  if (isProtected) {
    return (
      <div className="agent-protected-badge" style={{ padding: "0.75rem", borderRadius: "6px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", margin: "0.5rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--color-text)" }}>
          <span aria-hidden="true">🔒</span>
          <span>{PROTECTED_IP_MESSAGE}</span>
        </div>
        <p className="muted" style={{ fontSize: "var(--text-xs)", margin: "0.25rem 0 0" }}>
          {PROTECTED_IP_EXPLANATION}
        </p>
      </div>
    );
  }

  return (
    <details className="agent-editor">
      <summary>Edit agent files (6-File Contract)</summary>
      {action ? (
        <form action={action} className="file-form">
          <input type="hidden" name="agent_id" value={file.agent_id} />
          {fields.map(({ key, label, hint }) => (
            <label key={key}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{label}</strong>
                <small className="muted">{hint}</small>
              </div>
              <textarea
                name={key}
                rows={key === "jobdescription" ? 5 : 3}
                defaultValue={file[key as keyof AgentFile]}
                placeholder={`Enter ${label} instructions...`}
              />
            </label>
          ))}
          <button className="button button-primary" type="submit">
            Save 6-File Contract
          </button>
        </form>
      ) : (
        <div className="file-form-view">
          {fields.map(({ key, label }) => (
            <div key={key} style={{ margin: "0.5rem 0" }}>
              <strong>{label}</strong>
              <pre style={{ background: "var(--color-surface-2)", padding: "0.5rem", borderRadius: "4px", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                {file[key as keyof AgentFile] || "Empty file"}
              </pre>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}
