import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductionProgress } from "@/components/product/production-progress";
import { ShotUploader } from "@/components/product/shot-uploader";
import { ProviderExportButtons } from "@/components/product/provider-export-buttons";
import {
  updateProductionStatus,
  updateProductionMode,
  advanceProduction,
  decideProductionApproval,
  enqueueProductionJob,
  selectShotClip,
  saveAssemblyDecision,
  attachProductionDna,
  spawnCastingDna,
  createProductionLanePlan,
  saveProviderHandoffArtifact,
  compileProductionDnaSheet,
  saveProductionBudgetGuideline,
} from "@/app/(product)/actions";
import { DEPARTMENTS, JOB_KINDS } from "@/lib/studio/domain";
import { castingFitScore } from "@/lib/studio/casting-fit";

type ShotClipRecord = {
  id: string;
  version: number;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  selected: boolean;
};

type ShotRecord = {
  id: string;
  shot_number: number;
  prompt: string;
  duration_ms: number;
  status: string;
  shot_clips?: ShotClipRecord[] | null;
};

export default async function ProductionPage({
  params,
  searchParams,
}: {
  params: Promise<{ productionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { productionId } = await params;
  const search = await searchParams;
  const supabase = await createClient();

  const { data: production, error: productionError } = await supabase
    .from("productions")
    .select("id, workspace_id, title, brief, status, current_step, step_count, run_mode, data, channel_id")
    .eq("id", productionId)
    .single();

  if (productionError || !production) notFound();

  const [
    { data: events, error: eventsError },
    { data: artifacts, error: artifactsError },
    { data: approvals, error: approvalsError },
    { data: jobs, error: jobsError },
    { data: shots, error: shotsError },
    { data: agents, error: agentsError },
    { data: connections, error: connectionsError },
    { data: assemblyDecisions, error: assemblyError },
    { data: dnaRecords, error: dnaError },
    { data: lanePlans },
    { data: budgetGuideline },
  ] = await Promise.all([
    supabase
      .from("production_events")
      .select("id, event_type, from_step, to_step, created_at")
      .eq("production_id", productionId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("production_artifacts")
      .select("id, department_step, kind, version, status, content, storage_path, created_at")
      .eq("production_id", productionId)
      .order("version", { ascending: true }),
    supabase
      .from("production_approvals")
      .select("id, department_step, status, note, created_at")
      .eq("production_id", productionId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("job_queue")
      .select("id, kind, status, error_message, credit_reservation, attempts, created_at")
      .eq("production_id", productionId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("genplay_shots")
      .select("id, shot_number, prompt, duration_ms, status, shot_clips(id, version, storage_path, mime_type, byte_size, selected)")
      .eq("production_id", productionId)
      .order("shot_number", { ascending: true }),
    supabase
      .from("agents")
      .select("id, name, capabilities, protected_config")
      .eq("workspace_id", production.workspace_id)
      .order("name"),
    supabase
      .from("provider_connections")
      .select("id, label, provider, default_model, capabilities")
      .eq("workspace_id", production.workspace_id)
      .eq("status", "active")
      .order("label"),
    supabase.from("assembly_decisions").select("shot_id, position, keep, trim_start_ms, trim_end_ms, audio_choice").eq("production_id", productionId).order("position"),
    supabase.from("dna_records").select("id, dna_id, dna_type, tier, record").order("updated_at", { ascending: false }),
    supabase.from("production_lane_plans").select("id, lane_name, lane_kind, required_count, status").eq("production_id", productionId).order("created_at"),
    supabase.from("production_budget_guidelines").select("guideline_credits, notes").eq("production_id", productionId).maybeSingle(),
  ]);

  // hasQueryError split per-section below — no blanket banner here
  const currentStep = production.current_step ?? 0;
  const stepCount = production.step_count ?? 13;
  const currentDepartment = DEPARTMENTS[currentStep] ?? `Stage ${currentStep + 1}`;
  const currentArtifacts = (artifacts ?? []).filter((a) => a.department_step === currentStep);
  const decisions = (assemblyDecisions ?? []) as Array<{ shot_id: string; position: number; keep: boolean; trim_start_ms: number; trim_end_ms: number | null; audio_choice: string | null }>;

  return (
    <section className="product-page shell">
      <Link className="text-link" href={`/app/channels/${production.channel_id}`}>
        ← Channel
      </Link>

      <h1>{production.title}</h1>

      {search.error === "production" && <p className="form-error" role="alert">Unable to update this production.</p>}
      {search.error === "job" && <p className="form-error" role="alert">Unable to enqueue generation job.</p>}
      {search.error === "approval" && <p className="form-error" role="alert">Unable to record approval decision.</p>}
      {search.error === "clip" && <p className="form-error" role="alert">Unable to select clip.</p>}

      {/* Production workflow panel */}
      <div className="panel">
        <div className="section-head">
          <div>
            <h2>Production workflow</h2>
            <p className="muted">
              Stage {Math.min(currentStep + 1, stepCount)} of {stepCount}: {currentDepartment}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <form action={updateProductionStatus} className="inline-form">
              <input type="hidden" name="production_id" value={production.id} />
              <label>
                Status
                <select name="status" defaultValue={production.status}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="shipped">Shipped</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <button className="button button-outline" type="submit">Update</button>
            </form>

            <form action={updateProductionMode} className="inline-form">
              <input type="hidden" name="production_id" value={production.id} />
              <label>
                Run mode
                <select name="run_mode" defaultValue={production.run_mode}>
                  <option value="manual">Manual</option>
                  <option value="semi_auto">Semi-Auto</option>
                  <option value="auto">Auto</option>
                </select>
              </label>
              <button className="button button-outline" type="submit">Set</button>
            </form>
          </div>
        </div>

        <ProductionProgress currentStep={currentStep} runMode={production.run_mode} />
      </div>

      {/* Artifacts & Advance Section */}
      <div className="panel">
        {artifactsError && <p className="form-error" role="alert">Unable to load artifacts — Refresh</p>}
        <div className="section-head">
          <div>
            <h2>Stage Artifacts</h2>
            <p className="muted">Deliverables generated for {currentDepartment} (Stage {currentStep + 1})</p>
          </div>
          {currentArtifacts.length > 0 && production.status === "active" && currentStep < stepCount && (
            <form action={advanceProduction} className="inline-form">
              <input type="hidden" name="production_id" value={production.id} />
              <label>
                Choose artifact to advance:
                <select name="artifact_id" required defaultValue={currentArtifacts[0]?.id}>
                  {currentArtifacts.map((art) => (
                    <option key={art.id} value={art.id}>
                      v{art.version} — {art.kind} ({art.status})
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-primary" type="submit">Advance Production →</button>
            </form>
          )}
        </div>

        {currentArtifacts.length > 0 ? (
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {currentArtifacts.map((art) => (
              <div key={art.id} style={{ padding: "0.75rem", borderRadius: "6px", background: "var(--surface-muted, #151515)", border: "1px solid var(--border-subtle, #333)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Version {art.version} ({art.kind})</strong>
                  <span className="muted" style={{ marginLeft: "0.5rem" }}>Status: {art.status}</span>
                </div>
                <small className="muted">{new Date(art.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">
            No artifacts for stage {currentStep + 1} ({currentDepartment}) — enqueue a generation job below.
          </p>
        )}
      </div>
      {/* Approvals Section */}
      {approvalsError && <p className="form-error" role="alert">Unable to load approvals — Refresh</p>}
      {approvals && approvals.length > 0 && (
        <div className="panel">
          <div className="section-head">
            <div>
              <h2>Pending Approvals</h2>
              <p className="muted">Human sign-offs required before advancing</p>
            </div>
          </div>
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {approvals.map((appr) => (
              <div key={appr.id} style={{ padding: "1rem", borderRadius: "6px", background: "var(--surface-muted, #151515)", border: "1px solid var(--border-subtle, #333)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong>Approval for Stage {appr.department_step + 1} ({DEPARTMENTS[appr.department_step] ?? ""})</strong>
                  <small className="muted">{new Date(appr.created_at).toLocaleString()}</small>
                </div>
                <form action={decideProductionApproval} className="inline-form" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="production_id" value={production.id} />
                  <input type="hidden" name="approval_id" value={appr.id} />
                  <input
                    name="note"
                    type="text"
                    placeholder="Approval note (optional)"
                    className="input"
                    style={{ flexGrow: 1, minWidth: "200px" }}
                  />
                  <button name="decision" value="approved" className="button button-primary" type="submit">Approve</button>
                  <button name="decision" value="rejected" className="button button-outline" type="submit">Reject</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Jobs Queue Section */}
      <div className="panel">
        {jobsError && <p className="form-error" role="alert">Unable to load jobs — Refresh</p>}
        <div className="section-head">
          <div>
            <h2>Jobs & Generation</h2>
            <p className="muted">Enqueue background tasks for the current stage</p>
          </div>
        </div>

        {production.status === "active" && (
          <>
            {agentsError && <p className="form-error" role="alert">Unable to load agents — Refresh</p>}
            {connectionsError && <p className="form-error" role="alert">Unable to load connections — Refresh</p>}
          <form action={enqueueProductionJob} className="inline-form" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", padding: "1rem", borderRadius: "6px", background: "var(--surface-muted, #111)", border: "1px solid var(--border-subtle, #333)" }}>
            <label>
              Job Kind
              <select name="kind" required defaultValue={currentStep === 8 ? "assemble_master" : "generate_text"}>
                {JOB_KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </label>

            <label>
              Agent
              <select name="agent_id" required>
                {(agents ?? []).map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.capabilities?.join(", ")})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Connection (Optional for Protected)
              <select name="connection_id">
                <option value="">(None / Protected)</option>
                {(connections ?? []).map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.label} ({conn.default_model})
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="button button-primary" type="submit">Enqueue job</button>
            </div>
          </form>
          </>
        )}

        {jobs && jobs.length > 0 ? (
          <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {jobs.map((j) => (
              <div key={j.id} style={{ padding: "0.75rem", borderRadius: "6px", background: "var(--surface-muted, #151515)", border: "1px solid var(--border-subtle, #333)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{j.kind}</strong> — <span className={`tag tag-${j.status}`}>{j.status}</span>
                  {j.error_message && <span style={{ color: "#ef4444", marginLeft: "0.5rem", fontSize: "0.875rem" }}>{j.error_message}</span>}
                </div>
                <small className="muted">{new Date(j.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No jobs queued.</p>
        )}
      </div>

      <div className="panel"><div className="section-head"><div><h2>Production lanes</h2><p className="muted">Add lanes sized to this episode&apos;s GenPlay needs.</p></div></div><form action={createProductionLanePlan} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><label>Lane name<input name="lane_name" required maxLength={120} placeholder="Continuity review" /></label><label>Kind<input name="lane_kind" required maxLength={80} placeholder="review" /></label><label>Count<input name="required_count" type="number" min="1" defaultValue="1" /></label><button className="button button-outline" type="submit">Add lane</button></form>{(lanePlans ?? []).length ? <ul className="event-list">{(lanePlans ?? []).map((lane) => <li key={lane.id}><strong>{lane.lane_name}</strong><span>{lane.lane_kind} · {lane.required_count}</span><span className={`status-mark ${lane.status}`}>{lane.status}</span></li>)}</ul> : <p className="muted">No episode-specific lanes yet.</p>}</div>

      <div className="panel"><h2>Model budget guideline</h2><form action={saveProductionBudgetGuideline} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><label>Guideline credits<input name="guideline_credits" type="number" min="0" defaultValue={budgetGuideline?.guideline_credits ?? ""} /></label><label>Notes<input name="notes" maxLength={2000} defaultValue={budgetGuideline?.notes ?? ""} /></label><button className="button button-outline" type="submit">Save guideline</button></form></div>

      <div className="panel">
        <div className="section-head"><div><h2>Casting gate</h2><p className="muted">Fit score compares casting brief words against look, feel, persona, lore, and summary.</p></div></div>
        {dnaError ? <p className="form-error" role="alert">Unable to load Universe records.</p> : null}
        {(dnaRecords ?? []).length ? <div className="catalog-list">{(dnaRecords as Array<{ id: string; dna_id: string; dna_type: string; tier: string; record: Record<string, unknown> | null }>).map((dna) => <article className="catalog-row" key={dna.id}><div><strong>{String(dna.record?.name ?? dna.dna_id)}</strong><p className="muted">{dna.dna_type} · {dna.tier}-tier · Fit {castingFitScore(production.brief ?? production.title, dna)}% · {String(dna.record?.summary ?? "No summary")}</p></div><form action={attachProductionDna} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><input type="hidden" name="dna_record_id" value={dna.id} /><button className="button button-outline" type="submit">Cast</button></form></article>)}</div> : <p className="muted">No Universe records yet.</p>}
        <form action={spawnCastingDna} className="stack-form compact-form"><h3>Spawn from minimum template (B-tier)</h3><input type="hidden" name="production_id" value={production.id} /><label>Type<select name="dna_type"><option value="CDNA">Character</option><option value="LDNA">Location</option><option value="PDNA">Prop</option></select></label><label>Name<input name="name" maxLength={120} required /></label><label>Minimum look / persona / lore<textarea name="summary" maxLength={5000} rows={3} required /></label><button className="button button-outline" type="submit">Spawn and cast</button></form>
        <Link className="button button-outline" href="/app/universe">Create DNA in Universe</Link>
        <form action={compileProductionDnaSheet} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><button className="button button-outline" type="submit">Compile master DNA sheet</button></form>
      </div>

      {/* Shot Assembly Section (step 8 or when shots exist) */}
      {(currentStep === 8 || (shots && shots.length > 0)) && (
        <div className="panel">
          <details><summary className="text-link">Provider handoff import/export</summary><form action={saveProviderHandoffArtifact} className="inline-form"><input type="hidden" name="production_id" value={production.id} /><label>Kind<select name="kind"><option>prompt</option><option>result</option><option>image</option><option>video</option><option>audio</option></select></label><label>Provider<input name="provider" maxLength={120} /></label><label>JSON payload<textarea name="payload" required rows={3} placeholder='{"prompt":"..."}' /></label><button className="button button-outline" type="submit">Save handoff artifact</button></form></details>
          {assemblyError ? <p className="form-error" role="alert">Unable to load assembly decisions.</p> : null}
          {shotsError && <p className="form-error" role="alert">Unable to load shots — Refresh</p>}
          <div className="section-head">
            <div>
              <h2>Shot Assembly</h2>
              <p className="muted">Upload and select video clips for each shot before final assembly</p>
            </div>
          </div>

          {shots && shots.length > 0 ? (
            <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {(shots as ShotRecord[]).map((shot) => (
                <div key={shot.id} style={{ padding: "1rem", borderRadius: "6px", background: "var(--surface-muted, #151515)", border: "1px solid var(--border-subtle, #333)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong>Shot {shot.shot_number} ({Math.round(shot.duration_ms / 1000)}s)</strong>
                    <span className="muted">Status: {shot.status}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary, #ccc)", marginBottom: "1rem" }}>{shot.prompt}</p>
                  <ProviderExportButtons shot={{ shot_number: shot.shot_number, prompt: shot.prompt, duration_ms: shot.duration_ms }} />

                  <ShotUploader workspaceId={production.workspace_id} productionId={production.id} shotId={shot.id} />

                  {shot.shot_clips && shot.shot_clips.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Uploaded Clips:</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {shot.shot_clips.map((clip) => (
                          <div key={clip.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", borderRadius: "4px", background: "var(--surface-muted, #111)" }}>
                            <span>v{clip.version} — {(clip.byte_size / (1024 * 1024)).toFixed(1)} MB {clip.selected ? "✓ (Selected)" : ""}</span>
                            {!clip.selected && (
                              <form action={selectShotClip}>
                                <input type="hidden" name="production_id" value={production.id} />
                                <input type="hidden" name="shot_id" value={shot.id} />
                                <input type="hidden" name="clip_id" value={clip.id} />
                                <button className="button button-outline" type="submit" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Select</button>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <form action={saveAssemblyDecision} className="inline-form" style={{ marginTop: "1rem" }}>
                    <input type="hidden" name="production_id" value={production.id} /><input type="hidden" name="shot_id" value={shot.id} />
                    <label>Order<input name="position" type="number" min="0" defaultValue={decisions.find((d) => d.shot_id === shot.id)?.position ?? shot.shot_number - 1} required /></label>
                    <label className="check-row"><input name="keep" type="checkbox" defaultChecked={decisions.find((d) => d.shot_id === shot.id)?.keep ?? true} />Keep</label>
                    <label>Trim start ms<input name="trim_start_ms" type="number" min="0" defaultValue={decisions.find((d) => d.shot_id === shot.id)?.trim_start_ms ?? 0} /></label>
                    <label>Trim end ms<input name="trim_end_ms" type="number" min="0" defaultValue={decisions.find((d) => d.shot_id === shot.id)?.trim_end_ms ?? ""} /></label>
                    <label>Audio<input name="audio_choice" maxLength={120} defaultValue={decisions.find((d) => d.shot_id === shot.id)?.audio_choice ?? ""} /></label>
                    <button className="button button-outline" type="submit">Save edit decision</button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No GenPlay shots generated for this production yet.</p>
          )}
        </div>
      )}
      {/* Events Log */}
      <div className="panel">
        {eventsError && <p className="form-error" role="alert">Unable to load events — Refresh</p>}
        <div className="section-head">
          <div>
            <h2>Recent events</h2>
            <p className="muted">Audit trail of status and step changes</p>
          </div>
        </div>
        <div className="stack">
          {(events ?? []).map((event) => (
            <div className="split-row" key={event.id}>
              <div>
                <strong>{event.event_type}</strong>
                <p className="muted">From stage {(event.from_step ?? 0) + 1} to {(event.to_step ?? 0) + 1}</p>
              </div>
              <time className="muted">{new Date(event.created_at).toLocaleString()}</time>
            </div>
          ))}
          {(!events || events.length === 0) && <p className="muted">No events recorded yet.</p>}
        </div>
      </div>
    </section>
  );
}
