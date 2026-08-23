import { describe, expect, it } from "vitest";
import { createStudioTrace, getLangfuseClient, scoreStudioTrace } from "./langfuse";

describe("langfuse tracing", () => {
  it("returns null client when unconfigured", () => {
    expect(getLangfuseClient()).toBeNull();
  });

  it("creates no-op tracer when client is not configured", async () => {
    const tracer = createStudioTrace({
      jobId: "job-123",
      jobKind: "generate_text",
      workspaceId: "ws-123",
      productionId: "prod-123",
      productionTitle: "Test Film",
      step: 0,
      agent: { id: "agent-1", name: "Writer" },
      model: "gpt-4",
      taskPrompt: "Write a script",
    });

    expect(tracer.traceId).toBe("trace-job-123");
    expect(() => tracer.recordGeneration({ name: "gen", model: "gpt-4", input: "prompt", output: "result" })).not.toThrow();
    expect(() => tracer.recordError(new Error("test error"))).not.toThrow();
    await expect(tracer.end()).resolves.toBeUndefined();
    await expect(scoreStudioTrace("trace-job-123", "quality", 1)).resolves.toBe(false);
  });
});
