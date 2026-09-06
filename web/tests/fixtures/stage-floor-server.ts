// Local browser fixture only. Server actions and navigation are replaced; no live workspace is contacted.
import { createServer, type ViteDevServer } from "vite";
import path from "node:path";
import type { StageFloorData, StageRule } from "../../lib/studio/stage-floor-types";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const now = "2026-09-05T10:00:00Z";
export function fixtureData(): StageFloorData {
  return {
    workflows: [1, 2].map((n) => ({ id: id(n), name: n === 1 ? "Launch campaign" : "Audience research", description: "", definition: {}, updated_at: now })),
    agents: ["Research director", "Story editor", "Social producer"].map((name, i) => ({ id: id(10 + i), name, lane_id: id(20 + i), agent_type: "worker", capabilities: [i === 2 ? "social" : "text"], protected_config: i === 1, recommended_tier: "mid", model_tier_override: null })),
    lanes: ["Marketing", "Creative", "Social"].map((name, i) => ({ id: id(20 + i), name })),
    rules: [{ id: id(30), workflow_id: id(1), position: 0, source_kind: "agent", source_agent_id: id(10), source_lane_id: null, target_kind: "agent", target_agent_id: id(11), target_lane_id: null, trigger_event: "completion" }],
    executions: [], steps: [], error: null,
  };
}

export async function startStageFixture(): Promise<{ server: ViteDevServer; url: string; reset: (empty?: boolean, error?: boolean) => void }> {
  let data = fixtureData();
  let counter = 100;
  const navigation = `import {useSyncExternalStore} from 'react';
    const listen=(cb)=>{window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb)};
    const snapshot=()=>window.location.search;
    export function useSearchParams(){return new URLSearchParams(useSyncExternalStore(listen,snapshot,snapshot))}
    export function usePathname(){return window.location.pathname}
    export function useRouter(){return {replace:(url)=>{history.replaceState(null,'',url);window.dispatchEvent(new PopStateEvent('popstate'))},push:(url)=>{history.pushState(null,'',url);window.dispatchEvent(new PopStateEvent('popstate'))},refresh:()=>window.dispatchEvent(new Event('fixture-refresh'))}};`;
  const server = await createServer({
    configFile: false, root: path.resolve(process.cwd()), logLevel: "error",
    resolve: { alias: { "@": path.resolve(process.cwd()) } },
    server: { host: "127.0.0.1", port: 0 },
    plugins: [{
      name: "stage-floor-local-fixture", enforce: "pre",
      resolveId(source) {
        if (source === "next/navigation") return "\0fixture-navigation";
        if (source === "next/link") return "\0fixture-link";
        if (source.endsWith("/(product)/stage-floor-actions")) return "\0fixture-action";
      },
      load(source) {
        if (source === "\0fixture-navigation") return navigation;
        if (source === "\0fixture-link") return "import{createElement}from'react';export default function Link({children,...props}){return createElement('a',props,children)}";
        if (source === "\0fixture-action") return `export async function stageFloorAction(previous,form){await new Promise(r=>setTimeout(r,80));const response=await fetch('/fixture-action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(form))});const result=await response.json();window.dispatchEvent(new Event('fixture-refresh'));return result}`;
      },
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const route = request.url?.split("?")[0];
          if (route === "/stage-fixture") {
            response.setHeader("Content-Type", "text/html");
            response.end(await server.transformIndexHtml(request.url!, '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/tests/fixtures/stage-floor-browser.tsx"></script></body></html>'));
          } else if (route === "/fixture-data") {
            response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify(data));
          } else if (route === "/fixture-action") {
            const chunks: Buffer[] = [];
            for await (const chunk of request) chunks.push(Buffer.from(chunk));
            const form = JSON.parse(Buffer.concat(chunks).toString()) as Record<string, string>;
            const workflowId = form.action === "create" ? id(counter++) : form.workflow_id;
            if (form.action === "create") data = { ...data, workflows: [...data.workflows, { id: workflowId, name: form.name, description: "", definition: {}, updated_at: now }] };
            if (form.action === "rename") data = { ...data, workflows: data.workflows.map((workflow) => workflow.id === workflowId ? { ...workflow, name: form.name } : workflow) };
            if (form.action === "connect") {
              const [sourceKind, sourceId] = form.source.split(":");
              const [targetKind, targetId] = form.target.split(":");
              data = { ...data, rules: [...data.rules, { id: id(counter++), workflow_id: workflowId, position: data.rules.length, source_kind: sourceKind, source_agent_id: sourceKind === "agent" ? sourceId : null, source_lane_id: sourceKind === "lane" ? sourceId : null, target_kind: targetKind, target_agent_id: targetKind === "agent" ? targetId : null, target_lane_id: targetKind === "lane" ? targetId : null, trigger_event: form.trigger_event } as StageRule] };
            }
            if (form.action === "disconnect") data = { ...data, rules: data.rules.filter((rule) => rule.id !== form.rule_id) };
            if (form.action === "start") {
              const executionId = id(counter++);
              const rule = data.rules.find((rule) => rule.workflow_id === workflowId)!;
              data = { ...data, executions: [{ id: executionId, workflow_id: workflowId, status: "running", current_agent_id: rule.target_agent_id, current_lane_id: rule.target_lane_id, created_at: now }, ...data.executions], steps: [...data.steps, { id: id(counter++), execution_id: executionId, handoff_rule_id: rule.id, status: "running", target_agent_id: rule.target_agent_id, target_lane_id: rule.target_lane_id, error_message: null, created_at: now, output_payload: {} }] };
            }
            if (["complete", "fail", "cancel"].includes(form.action)) data = { ...data, executions: data.executions.map((execution) => execution.id === form.execution_id ? { ...execution, status: form.action === "complete" ? "completed" : form.action === "fail" ? "failed" : "cancelled" } : execution), steps: data.steps.map((step) => step.id === form.step_id ? { ...step, status: form.action === "complete" ? "completed" : "failed", output_payload: { result: form.output ?? "" } } : step) };
            response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ ok: true, message: "Saved successfully.", workflowId }));
          } else next();
        });
      },
    }],
  });
  await server.listen();
  return { server, url: server.resolvedUrls!.local[0].replace(/\/$/, "") + "/stage-fixture", reset(empty = false, error = false) { data = empty ? { workflows: [], agents: [], lanes: [], rules: [], executions: [], steps: [], error: null } : fixtureData(); if (error) data = { ...data, error: "Unable to load this Stage Floor. Refresh to retry." }; } };
}
