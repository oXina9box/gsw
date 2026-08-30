import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Staffing" };

export default async function StaffingPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ count: lanes, error: lanesError }, { count: agents, error: agentsError }, { count: available, error: availableError }] = await Promise.all([
    supabase.from("lanes").select("id", { count: "exact", head: true }),
    supabase.from("agents").select("id", { count: "exact", head: true }),
    supabase.from("agent_catalog").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  const loadError = lanesError || agentsError || availableError;

  return (
    <section className="product-page shell" data-archetype="B1-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Staffing.
        </h1>
        <p className="text-base text-text-muted font-body">
          Build internal teams. Review specialist agents available to hire.
        </p>
      </div>

      {loadError ? (
        <p className="form-error mb-6" role="alert">
          Some staffing data could not load. Refresh to try again.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/app/builder" className="block group">
          <PrelineCard
            kicker={`${agentsError ? "—" : agents ?? 0} agents · ${lanesError ? "—" : lanes ?? 0} teams`}
            title="Team & Pipeline"
            subtitle="Manage department lanes, roles, and agent working files"
            footer={<span className="text-cyan group-hover:underline">Open Pipeline Builder →</span>}
            className="h-full group-hover:border-cyan transition-colors duration-150"
          >
            <p className="text-sm text-text-muted font-body">
              Assign specialized AI agents to 13 production lanes. Customize 6-file directives, prompt templates, and approval thresholds.
            </p>
          </PrelineCard>
        </Link>

        <Link href="/app/agents" className="block group">
          <PrelineCard
            kicker={`${availableError ? "—" : available ?? 0} available`}
            title="Agent Applications"
            subtitle="Review agent capabilities, entitlements, and role fit before hiring"
            footer={<span className="text-cyan group-hover:underline">Browse Agent Catalog →</span>}
            className="h-full group-hover:border-cyan transition-colors duration-150"
          >
            <p className="text-sm text-text-muted font-body">
              Explore officially verified role specialists and community agents with transparent token costs and capabilities.
            </p>
          </PrelineCard>
        </Link>
      </div>
    </section>
  );
}
