import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { classifyInventory } from "../../lib/studio/foundations";
import { JOB_KINDS } from "../../lib/studio/domain";
describe("inventory coverage", () => {
  it("classifies known tables/buckets/jobs", () => {
    expect(() =>
      classifyInventory([
        { kind: "table", name: "productions" },
        { kind: "table", name: "production_artifacts" },
        { kind: "bucket", name: "creative-assets" },
        { kind: "job", name: "assemble_master" },
        { kind: "event", name: "job_run" },
      ]),
    ).not.toThrow();
  });

  it("every JOB_KINDS entry classified", () => {
    for (const name of JOB_KINDS) {
      expect(() => classifyInventory([{ kind: "job", name }])).not.toThrow();
    }
  });

  it("all migration tables on allowlist or classified", () => {
    const allowUnclassified = new Set([
      "public.account_deletion_requests",
      "public.agent_catalog",
      "public.agent_catalog_files",
      "public.agent_entitlements",
      "public.agent_files",
      "public.agents",
      "public.beta_invites",
      "public.channels",
      "public.commerce_products",
      "public.credit_accounts",
      "public.credit_ledger",
      "public.departments",
      "public.dna_records",
      "public.executions",
      "public.execution_steps",
      "public.generated_assets",
      "public.genplay_binders",
      "public.genplay_masters",
      "public.handoff_rules",
      "public.lanes",
      "public.model_catalog",
      "public.orchestration_events",
      "public.genplay_shots",
      "public.job_queue",
      "public.production_approvals",
      "public.production_artifacts",
      "public.production_dna",
      "public.production_events",
      "public.productions",
      "public.profiles",
      "public.provider_connections",
      "public.provider_secrets",
      "public.publications",
      "public.purchases",
      "public.shot_clips",
      "public.signals",
      "public.social_connections",
      "public.social_connection_secrets",
      "public.social_metrics",
      "public.storage_purge_queue",
      "public.workflows",
      "public.workspace_members",
      "public.workspaces",
      "public.workspace_storage_usage",
      "public.payment_events",
      "public.signals",
    ]);
    const migDir = path.resolve(__dirname, "../../../supabase/migrations");
    const files = readdirSync(migDir).filter((f) => f.endsWith(".sql"));
    const tables = new Set<string>();
    for (const file of files) {
      const content = readFileSync(path.join(migDir, file), "utf-8");
      const re = /create table(?: if not exists)?\s+([a-z0-9_."]+)/gi;
      for (const match of content.matchAll(re)) {
        const name = match[1].replace(/"/g, "").toLowerCase();
        if (name.startsWith("public.")) tables.add(name);
      }
    }
    const mustClassify = [...tables].filter((t) => !allowUnclassified.has(t));
    for (const t of mustClassify) {
      const short = t.replace("public.", "");
      expect(
        () => classifyInventory([{ kind: "table", name: short }]),
        `${t} unclassified — add to REGISTRY or allowlist`,
      ).not.toThrow();
    }
  });
});
