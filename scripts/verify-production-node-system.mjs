import { readFileSync } from "node:fs";

const files = {
  page: readFileSync("web/app/(product)/app/orchestration/page.tsx", "utf8"),
  canvas: readFileSync("web/components/product/production-node-canvas.tsx", "utf8"),
  workbench: readFileSync("web/components/product/production-node-workbench.tsx", "utf8"),
  inspector: readFileSync("web/components/product/agent-node-inspector.tsx", "utf8"),
  rail: readFileSync("web/components/product/handoff-context-rail.tsx", "utf8"),
};

const checks = {
  composition: ["ProductionNodeWorkbench", "ProductionNodeCanvas", "AgentNodeInspector", "HandoffContextRail"].every((text) => files.page.includes(text) || files.workbench.includes(text)),
  canvasAccessibility: ["aria-label", "aria-pressed", "onKeyDown", "tabIndex"].every((text) => files.canvas.includes(text)),
  protectedBoundary: ["protected_config", "filterAgentFilesForClient", "sanitizeAgentFiles"].every((text) => files.page.includes(text)),
  inspectorContract: ["role.md", "soul.md", "jobdescription.md", "skills.md", "memory.md", "user.md", "return_to", "inspector-protected"].every((text) => files.inspector.includes(text)),
  handoffPayloads: ["source_id", "target_id", "input_payload", "output_payload", "getHandoffDirection"].every((text) => files.rail.includes(text)),
};

const failed = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) throw new Error(`production node verification failed: ${failed.join(", ")}`);
console.log("production node verification passed");
