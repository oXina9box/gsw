"use client";

import { getHandoffDirection } from "@/lib/orchestration/visual-flow";

export type HandoffDocument = { id: string; workflow_id?: string; title: string; source: string; source_id?: string; source_lane_id?: string; target?: string; target_id?: string; target_lane_id?: string; status: string; kind?: string; input_payload?: Record<string, unknown>; output_payload?: Record<string, unknown>; created_at?: string };
type Props = { documents: readonly HandoffDocument[]; selectedAgentId?: string | null; selectedLaneId?: string | null };

function preview(value: unknown) { if (value === null || value === undefined) return "No payload"; const text = typeof value === "string" ? value : JSON.stringify(value); return text.length > 220 ? `${text.slice(0, 220)}…` : text; }
function timestamp(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : date.toISOString().replace("T", " ").slice(0, 16) + " UTC"; }

export function HandoffContextRail({ documents, selectedAgentId, selectedLaneId }: Props) {
  const visible = selectedAgentId
    ? documents.filter(
        (document) =>
          document.target_id === selectedAgentId ||
          document.source_id === selectedAgentId ||
          (!!selectedLaneId && (document.source_lane_id === selectedLaneId || document.target_lane_id === selectedLaneId)),
      )
    : documents;
  return <section className="handoff-context-rail panel" aria-label="Handoff context">
    <div className="section-head"><div><p className="kicker">Context chain</p><h2>Documents in motion</h2><p className="muted">Completed outputs become read-only input for the next agent.</p></div><span className="status-mark lime">{visible.length} docs</span></div>
    {visible.length ? <div className="handoff-document-list">{visible.map((document) => <article className="handoff-document" key={document.id}>
      <header><div><strong>{document.title}</strong><small>{document.kind ?? "handoff"} · {document.status}</small></div><span className="handoff-document-source">{getHandoffDirection(document, selectedAgentId)}</span></header>
      <p className="handoff-route">{document.source} <span aria-hidden="true">↳</span> {document.target ?? "next agent"}</p>
      <details><summary>View payload</summary><dl><div><dt>Input</dt><dd><code>{preview(document.input_payload)}</code></dd></div><div><dt>Output</dt><dd><code>{preview(document.output_payload)}</code></dd></div></dl></details>
      {document.created_at && <time dateTime={document.created_at}>{timestamp(document.created_at)}</time>}
    </article>)}</div> : <p className="muted handoff-empty">No completed handoff documents yet. Complete a node to start the chain.</p>}
  </section>;
}
