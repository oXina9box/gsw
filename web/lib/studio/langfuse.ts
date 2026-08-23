// ponytail: stdlib and minimal Langfuse wrapper with graceful no-op when unconfigured
import { createHash } from "node:crypto";
import { Langfuse } from "langfuse";
import { createAuditEvent } from "./foundations";

let client: Langfuse | null = null;

export function getLangfuseClient(): Langfuse | null {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY || process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || "https://cloud.langfuse.com";

  if (!publicKey || !secretKey) {
    return null;
  }

  if (!client) {
    client = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
    });
  }

  return client;
}

export type StudioTraceContext = {
  jobId: string;
  jobKind: string;
  workspaceId: string;
  productionId: string;
  productionTitle: string;
  step: number;
  agent: { id: string; name: string; version?: string | null };
  model: string;
  providerConnectionId?: string;
  taskPrompt: string;
};

type GenerationParams = {
  name: string;
  model: string;
  input: unknown;
  output: unknown;
};

export type StudioTracer = {
  traceId: string;
  recordGeneration: (params: GenerationParams) => void;
  recordError: (error: unknown) => void;
  end: (output?: unknown) => Promise<void>;
};

export function createStudioTrace(ctx: StudioTraceContext): StudioTracer {
  const lf = getLangfuseClient();
  const traceId = `trace-${ctx.jobId}`;

  if (!lf) {
    return {
      traceId,
      recordGeneration: () => {},
      recordError: () => {},
      end: async () => {},
    };
  }

  const capability = ctx.jobKind.replace("generate_", "");
  const trace = lf.trace({
    id: traceId,
    name: `studio.${ctx.jobKind}`,
    sessionId: ctx.productionId,
    userId: ctx.workspaceId,
    tags: ["gem-studio", capability, ctx.agent.name, `stage-${ctx.step + 1}`],
    metadata: {
      production_title: ctx.productionTitle,
      step: ctx.step,
      department_stage: ctx.step + 1,
      agent_id: ctx.agent.id,
      agent_name: ctx.agent.name,
      agent_version: ctx.agent.version ?? null,
      provider_connection_id: ctx.providerConnectionId ?? null,
      model: ctx.model,
    },
    input: {
      task_hash: createHash("sha256").update(ctx.taskPrompt).digest("hex").slice(0, 16),
    },
  });

  return {
    traceId,
    recordGeneration: ({ name, model, input, output }: GenerationParams) => {
      const input_hash = createHash("sha256").update(typeof input === "string" ? input : JSON.stringify(input)).digest("hex").slice(0, 16);
      const output_hash = createHash("sha256").update(typeof output === "string" ? output : JSON.stringify(output)).digest("hex").slice(0, 16);
      trace.generation({
        name,
        model,
        input: { input_hash },
        output: { output_hash },
      });
    },
    recordError: () => {
      const audit = createAuditEvent({ action: "trace_error", target: traceId, outcome: "failed" });
      trace.update({
        metadata: { safeErrorClass: audit.safeErrorClass ?? "operation_failed" },
      });
    },
    end: async (output?: unknown) => {
      if (output !== undefined) {
        const output_hash = createHash("sha256").update(typeof output === "string" ? output : JSON.stringify(output)).digest("hex").slice(0, 16);
        trace.update({ output: { output_hash } });
      }
      await lf.flushAsync().catch(() => {});
    },
  };
}

export async function scoreStudioTrace(traceId: string, name: string, value: number, comment?: string): Promise<boolean> {
  const lf = getLangfuseClient();
  if (!lf) return false;
  try {
    lf.score({
      traceId,
      name,
      value,
      comment,
    });
    await lf.flushAsync().catch(() => {});
    return true;
  } catch {
    return false;
  }
}
