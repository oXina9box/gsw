import { notFound } from "next/navigation";
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
} from "@/app/(product)/actions";
import { DEPARTMENTS, JOB_KINDS } from "@/lib/studio/domain";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
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
    { data: artifacts, error: artifactsError },
    { data: approvals, error: approvalsError },
    { data: jobs, error: jobsError },
    { data: shots, error: shotsError },
    { data: agents, error: agentsError },
    { data: connections, error: connectionsError },
    { data: assemblyDecisions, error: assemblyError },
    { data: dnaRecords, error: dnaError },
  ] = await Promise.all([
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
  ]);

  const currentStep = production.current_step ?? 0;
  const stepCount = production.step_count ?? 13;
  const currentDepartment = DEPARTMENTS[currentStep] ?? `Stage ${currentStep + 1}`;
  const currentArtifacts = (artifacts ?? []).filter((a) => a.department_step === currentStep);
  const decisions = (assemblyDecisions ?? []) as Array<{ shot_id: string; position: number; keep: boolean; trim_start_ms: number; trim_end_ms: number | null; audio_choice: string | null }>;

  return (
    <section className="product-page shell" data-archetype="B2-A">
      <div className="mb-4">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Channel", href: `/app/channels/${production.channel_id}` },
            { label: production.title, current: true },
          ]}
        />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          {production.title}
        </h1>
        <FlowbiteBadge color={production.status === "active" ? "lime" : "amber"}>
          {production.status}
        </FlowbiteBadge>
      </div>

      {search.error === "production" && <p className="form-error" role="alert">Unable to update this production.</p>}
      {search.error === "job" && <p className="form-error" role="alert">Unable to enqueue generation job.</p>}
      {search.error === "approval" && <p className="form-error" role="alert">Unable to record approval decision.</p>}
      {search.error === "clip" && <p className="form-error" role="alert">Unable to select clip.</p>}

      {/* Production workflow panel */}
      <div className="mb-8">
        <PrelineCard
          kicker={`Stage ${Math.min(currentStep + 1, stepCount)} of ${stepCount}`}
          title={currentDepartment}
          subtitle="Pipeline progression & execution mode"
          action={
            <div className="flex items-center gap-3">
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
                <button className="button button-outline text-xs" type="submit">Update</button>
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
                <button className="button button-outline text-xs" type="submit">Set</button>
              </form>
            </div>
          }
        >
          <ProductionProgress currentStep={currentStep} runMode={production.run_mode} />
        </PrelineCard>
      </div>

      {/* Artifacts & Advance Section */}
      <div className="mb-8">
        <PrelineCard
          kicker="Deliverables"
          title="Stage Artifacts"
          subtitle={`Deliverables generated for ${currentDepartment} (Stage ${currentStep + 1})`}
          action={
            currentArtifacts.length > 0 && production.status === "active" && currentStep < stepCount ? (
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
                <button className="button button-primary text-xs" type="submit">Advance Production →</button>
              </form>
            ) : undefined
          }
        >
          {artifactsError && <p className="form-error" role="alert">Unable to load artifacts — Refresh</p>}
          {currentArtifacts.length > 0 ? (
            <div className="space-y-2">
              {currentArtifacts.map((art) => (
                <div key={art.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between">
                  <div>
                    <strong className="text-sm text-text font-mono">Version {art.version} ({art.kind})</strong>
                    <span className="text-xs text-text-muted ml-3 font-mono">Status: {art.status}</span>
                  </div>
                  <small className="font-mono text-xs text-text-faint">{new Date(art.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted font-body">
              No artifacts for stage {currentStep + 1} ({currentDepartment}) — enqueue a generation job below.
            </p>
          )}
        </PrelineCard>
      </div>

      {/* Approvals Section */}
      {approvals && approvals.length > 0 && (
        <div className="mb-8">
          <PrelineCard
            kicker="Approval Gates"
            title="Pending Approvals"
            subtitle="Human sign-offs required before advancing"
          >
            {approvalsError && <p className="form-error" role="alert">Unable to load approvals — Refresh</p>}
            <div className="space-y-3">
              {approvals.map((appr) => (
                <div key={appr.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-semibold text-text">
                      Approval for Stage {appr.department_step + 1} ({DEPARTMENTS[appr.department_step] ?? ""})
                    </strong>
                    <small className="font-mono text-xs text-text-faint">{new Date(appr.created_at).toLocaleString()}</small>
                  </div>
                  <form action={decideProductionApproval} className="inline-form flex-wrap gap-2">
                    <input type="hidden" name="production_id" value={production.id} />
                    <input type="hidden" name="approval_id" value={appr.id} />
                    <input
                      name="note"
                      type="text"
                      placeholder="Approval note (optional)"
                      className="input grow"
                    />
                    <button name="decision" value="approved" className="button button-primary text-xs" type="submit">Approve</button>
                    <button name="decision" value="rejected" className="button button-outline text-xs" type="submit">Reject</button>
                  </form>
                </div>
              ))}
            </div>
          </PrelineCard>
        </div>
      )}

      {/* Jobs Queue Section */}
      <div className="mb-8">
        <PrelineCard
          kicker="Execution Engine"
          title="Jobs & Generation"
          subtitle="Enqueue background tasks for the current stage"
        >
          {jobsError && <p className="form-error" role="alert">Unable to load jobs — Refresh</p>}
          {production.status === "active" && (
            <div className="mb-6">
              {agentsError && <p className="form-error" role="alert">Unable to load agents — Refresh</p>}
              {connectionsError && <p className="form-error" role="alert">Unable to load connections — Refresh</p>}
              <form action={enqueueProductionJob} className="inline-form p-4 border border-border-2 bg-surface-2 rounded-sm mb-4">
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
                        {conn.label} ({conn.provider} · {conn.default_model})
                      </option>
                    ))}
                  </select>
                </label>

                <button className="button button-primary text-xs" type="submit">Enqueue Job</button>
              </form>
            </div>
          )}

          {jobs && jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-text uppercase">{job.kind}</span>
                    <FlowbiteBadge
                      color={job.status === "completed" ? "lime" : job.status === "failed" ? "red" : "amber"}
                      size="sm"
                    >
                      {job.status}
                    </FlowbiteBadge>
                    {job.attempts > 1 && <span className="text-text-faint">(Attempt {job.attempts})</span>}
                  </div>
                  <span className="text-text-faint">{new Date(job.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted font-body">No recent jobs for this production.</p>
          )}
        </PrelineCard>
      </div>

      {/* Shots & Video Pipeline Section */}
      <div className="mb-8">
        <PrelineCard
          kicker="Shot Binder"
          title="GenPlay Shots"
          subtitle={`${shots?.length ?? 0} total shots`}
        >
          {shotsError && <p className="form-error" role="alert">Unable to load shots — Refresh</p>}
          {shots && shots.length > 0 ? (
            <div className="space-y-4">
              {shots.map((shot: ShotRecord) => (
                <div key={shot.id} className="p-4 border border-border-2 bg-surface-2 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="font-mono text-sm text-text">Shot {shot.shot_number}</strong>
                    <FlowbiteBadge size="sm">{shot.status}</FlowbiteBadge>
                  </div>
                  <p className="text-xs font-mono text-text-muted bg-bg p-3 rounded-sm border border-border">
                    {shot.prompt}
                  </p>
                  <div className="pt-2">
                    <ProviderExportButtons
                      shot={{
                        shot_number: shot.shot_number,
                        prompt: shot.prompt,
                        duration_ms: shot.duration_ms,
                      }}
                    />
                  </div>
                  <div className="pt-2">
                    <ShotUploader
                      workspaceId={production.workspace_id}
                      productionId={production.id}
                      shotId={shot.id}
                    />
                  </div>
                  {shot.shot_clips && shot.shot_clips.length > 0 && (
                    <div className="pt-2 border-t border-hairline space-y-1">
                      <p className="font-mono text-xs text-text-faint uppercase">Clips:</p>
                      {shot.shot_clips.map((clip) => (
                        <div key={clip.id} className="flex items-center justify-between text-xs font-mono p-2 bg-surface rounded-sm">
                          <span>v{clip.version} ({Math.round(clip.byte_size / 1024)} KB)</span>
                          {clip.selected ? (
                            <FlowbiteBadge color="lime" size="sm">Selected</FlowbiteBadge>
                          ) : (
                            <form action={selectShotClip}>
                              <input type="hidden" name="production_id" value={production.id} />
                              <input type="hidden" name="shot_id" value={shot.id} />
                              <input type="hidden" name="clip_id" value={clip.id} />
                              <button className="button button-outline text-[10px] py-1 px-2" type="submit">Select</button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted font-body">No shots defined yet.</p>
          )}
        </PrelineCard>
      </div>

      {/* Assembly Section */}
      <div className="mb-8">
        <PrelineCard
          kicker="Master Assembly"
          title="Clip Assembly & Decisions"
          subtitle="Define master track layout and audio choices"
        >
          {assemblyError && <p className="form-error" role="alert">Unable to load assembly decisions</p>}
          <form action={saveAssemblyDecision} className="stack-form">
            <input type="hidden" name="production_id" value={production.id} />
            <div className="space-y-2">
              {(shots ?? []).map((shot: ShotRecord, index: number) => {
                const decision = decisions.find((d) => d.shot_id === shot.id);
                return (
                  <div key={shot.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between gap-4 text-xs font-mono">
                    <span>Position {index + 1}: Shot {shot.shot_number}</span>
                    <input type="hidden" name="shot_id" value={shot.id} />
                    <input type="hidden" name="position" value={index + 1} />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name={`keep_${shot.id}`} defaultChecked={decision ? decision.keep : true} />
                      Keep in master
                    </label>
                  </div>
                );
              })}
            </div>
            <button className="button button-primary mt-4 text-xs" type="submit">Save Assembly Decisions</button>
          </form>
        </PrelineCard>
      </div>

      {/* DNA Continuity Section */}
      <div className="mb-8">
        <PrelineCard
          kicker="Continuity Lock"
          title="Production DNA Casting"
          subtitle="Character, location, and prop continuity references"
        >
          {dnaError && <p className="form-error" role="alert">Unable to load DNA records</p>}
          <div className="space-y-4">
            <form action={attachProductionDna} className="inline-form p-3 border border-border-2 bg-surface-2 rounded-sm">
              <input type="hidden" name="production_id" value={production.id} />
              <label>
                Attach Existing DNA Record:
                <select name="dna_record_id">
                  {(dnaRecords ?? []).map((dna) => (
                    <option key={dna.id} value={dna.id}>
                      {dna.dna_id} ({dna.dna_type} · {dna.tier})
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-outline text-xs" type="submit">Attach</button>
            </form>

            <form action={spawnCastingDna} className="inline-form p-3 border border-border-2 bg-surface-2 rounded-sm">
              <input type="hidden" name="production_id" value={production.id} />
              <label>
                Spawn Character DNA:
                <input name="dna_id" placeholder="CHAR-LEAD-01" required />
              </label>
              <button className="button button-primary text-xs" type="submit">Spawn cDNA</button>
            </form>
          </div>
        </PrelineCard>
      </div>
    </section>
  );
}
