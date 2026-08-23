import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAuditEvent } from "@/lib/studio/foundations";
import { evaluateJobAdmission } from "@/lib/studio/caps";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeStudioJob } from "@/lib/studio/worker";
import { verifyWorkerAuthorization } from "@/lib/studio/worker-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!verifyWorkerAuthorization(request.headers.get("authorization"), process.env.WORKER_SECRET)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const encryptionKey = process.env.PROVIDER_SECRET_ENCRYPTION_KEY;
  if (!encryptionKey) return NextResponse.json({ error: "Worker encryption is not configured" }, { status: 503 });
  const admin = createAdminClient();
  const workerId = `web-${randomUUID()}`;
  const { data: jobs, error } = await admin.rpc("claim_studio_job", { worker_id: workerId });
  const job = jobs?.[0];
  if (error) return NextResponse.json({ error: "Could not claim work" }, { status: 500 });
  if (!job) return NextResponse.json({ processed: false }, { status: 200 });
  const [{ count: workspaceRunning, error: workspaceCountError }, { count: globalRunning, error: globalCountError }] = await Promise.all([
    admin.from("job_queue").select("id", { count: "exact", head: true }).eq("status", "running").eq("workspace_id", job.workspace_id).neq("id", job.id),
    admin.from("job_queue").select("id", { count: "exact", head: true }).eq("status", "running").neq("id", job.id),
  ]);
  const admission = evaluateJobAdmission({ workspaceRunning: workspaceRunning ?? 0, globalRunning: globalRunning ?? 0, policyAvailable: !workspaceCountError && !globalCountError });
  if (!admission.admit) {
    console.log(JSON.stringify(createAuditEvent({ actorId: "worker", workspaceId: job.workspace_id, action: "job_admission_deferred", target: job.id, outcome: "denied", metadata: { reason: admission.reason } })));
    return NextResponse.json({ processed: false, deferred: true, reason: admission.reason }, { status: 200 });
  }
  try {
    const result = await executeStudioJob(admin, job, encryptionKey);
    const { data: settled, error: finishError } = await admin.rpc("finish_studio_job", { target_job: job.id, worker_id: workerId, succeeded: true, job_result: result, failure_message: "", actual_credits: job.credit_reservation });
    if (finishError) throw new Error("Could not settle completed job");
    return NextResponse.json({ processed: true, job: job.id, status: settled?.status ?? "completed" });
  } catch (caught) {
    const rawMessage = caught instanceof Error ? caught.message : "Job failed";
    const safe = caught instanceof Error && caught.message.includes("not available") ? caught.message : "Job could not be processed";
    console.error(JSON.stringify(createAuditEvent({ actorId: "worker", workspaceId: job.workspace_id, action: "job_run", target: job.id, outcome: "failed", metadata: { kind: job.kind } })));
    const { error: settlementError } = await admin.rpc("finish_studio_job", { target_job: job.id, worker_id: workerId, succeeded: false, job_result: {}, failure_message: rawMessage.slice(0, 2000), actual_credits: 0 });
    if (settlementError) return NextResponse.json({ processed: true, job: job.id, status: "settlement_failed" }, { status: 500 });
    return NextResponse.json({ processed: true, job: job.id, status: "failed", error: safe }, { status: 500 });
  }
}
