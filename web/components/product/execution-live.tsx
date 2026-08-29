"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { advanceExecutionAction, completeExecutionStep, failExecutionStep, cancelExecutionAction } from "@/app/(product)/actions";

export type Execution = {
  id: string;
  workflow_id: string;
  status: string;
  current_lane_id: string | null;
  current_agent_id: string | null;
  context: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type ExecutionStep = {
  id: string;
  execution_id: string;
  handoff_rule_id: string | null;
  target_kind: "lane" | "agent" | null;
  target_lane_id: string | null;
  target_agent_id: string | null;
  status: string;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export type HandoffRule = {
  id: string;
  workflow_id: string;
  position: number;
  source_kind: "lane" | "agent";
  source_lane_id: string | null;
  source_agent_id: string | null;
  target_kind: "lane" | "agent";
  target_lane_id: string | null;
  target_agent_id: string | null;
  trigger_event: string;
};

export function ExecutionLive({ executions, steps }: { executions: Execution[]; steps: ExecutionStep[]; rules: HandoffRule[] }) {
  const [latestExecutions, setLatestExecutions] = useState<Execution[]>(executions);
  const [latestSteps, setLatestSteps] = useState<ExecutionStep[]>(steps);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("orchestration-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "executions" },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            const updated = payload.new as Execution;
            setLatestExecutions((prev) => {
              const filtered = prev.filter((e) => e.id !== updated.id);
              return [updated, ...filtered];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "execution_steps" },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            const updated = payload.new as ExecutionStep;
            setLatestSteps((prev) => {
              const filtered = prev.filter((s) => s.id !== updated.id);
              return [...filtered, updated];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="grid grid-single">
      {latestExecutions.map((execution) => {
        const execSteps = latestSteps.filter((s) => s.execution_id === execution.id);
        const activeStep = execSteps.find((s) => s.status === "running");

        return (
          <div className="card" key={execution.id}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Execution {execution.id.slice(0, 8)}</span>
                <h3>Status: <span className={`execution-status execution-status-${execution.status}`}>{execution.status}</span></h3>
              </div>
              <div className="row-wrap">
                {execution.status === "running" && (
                  <>
                    <form action={advanceExecutionAction}>
                      <input type="hidden" name="execution_id" value={execution.id} />
                      <input type="hidden" name="trigger_event" value="manual" />
                      <button type="submit" className="button button-outline">Manual trigger</button>
                    </form>
                    <form action={advanceExecutionAction}>
                      <input type="hidden" name="execution_id" value={execution.id} />
                      <input type="hidden" name="trigger_event" value="approval" />
                      <button type="submit" className="button button-outline">Supervisor approve</button>
                    </form>
                    <form action={advanceExecutionAction}>
                      <input type="hidden" name="execution_id" value={execution.id} />
                      <input type="hidden" name="trigger_event" value="timeout" />
                      <button type="submit" className="button button-outline">Kick back</button>
                    </form>
                    <form action={cancelExecutionAction}>
                      <input type="hidden" name="execution_id" value={execution.id} />
                      <button type="submit" className="button button-outline">Cancel</button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="context-panel">
              <p className="muted"><strong>Context:</strong> <code>{JSON.stringify(execution.context)}</code></p>
            </div>

            {activeStep && (
              <div className="panel active-step-panel">
                <h4>Active Step: {activeStep.id.slice(0, 8)} ({activeStep.target_kind})</h4>
                <div className="active-step-actions">
                  <form action={completeExecutionStep} className="inline-form inline-form-compact">
                    <input type="hidden" name="step_id" value={activeStep.id} />
                    <input name="output" placeholder='Output JSON e.g. {"result": "ok"}' defaultValue="{}" />
                    <button type="submit" className="button button-primary">Complete step</button>
                  </form>
                  <form action={failExecutionStep} className="inline-form inline-form-compact">
                    <input type="hidden" name="step_id" value={activeStep.id} />
                    <input name="error_message" placeholder="Failure reason" defaultValue="Step rejected" />
                    <button type="submit" className="button button-outline danger-button">Fail step</button>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4>Steps ({execSteps.length})</h4>
              {execSteps.length === 0 ? (
                <p className="muted">No step records.</p>
              ) : (
                <ul className="flow flow-grid mt-2">
                  {execSteps.map((step, idx) => (
                    <li key={step.id}>
                      <span className={`dot ${step.status === "completed" ? "lime" : step.status === "running" ? "cyan" : ""}`} />
                      <strong>Step {idx + 1}: {step.target_kind}</strong>
                      <small>{step.status} {step.error_message ? `(${step.error_message})` : ""}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
