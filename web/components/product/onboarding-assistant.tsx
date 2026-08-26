"use client";

import { useActionState } from "react";
import { requestOnboardingGuidance, type OnboardingAssistantState } from "@/app/(product)/actions";

const initial: OnboardingAssistantState = { ok: false, message: "Ask for a suggestion before saving this step." };

export function OnboardingAssistant({ connections }: { connections: ReadonlyArray<{ id: string; label: string; provider: string }> }) {
  const [state, action, pending] = useActionState(requestOnboardingGuidance, initial);
  if (!connections.length) return <aside className="panel"><strong>Studio assistant</strong><p className="muted">Add an active text BYOK provider in Integrations to get live guidance.</p></aside>;
  return <aside className="panel"><strong>Studio assistant</strong><form action={action} className="stack-form compact-form"><label>Text provider<select name="connection_id" required>{connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.label} · {connection.provider}</option>)}</select></label><label>Question<textarea name="prompt" maxLength={2000} rows={3} required placeholder="Help define first channel audience" /></label><button className="button button-outline" type="submit" disabled={pending}>{pending ? "Thinking…" : "Ask assistant"}</button></form><p className={state.ok ? "muted" : "form-error"} role="status">{state.message}</p></aside>;
}
