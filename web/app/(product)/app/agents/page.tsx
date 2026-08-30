import Link from "next/link";
import { hireCatalogAgent } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Agent Hiring" };

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await getWorkspaceContext();
  const [{ data: catalog }, { data: lanes }, { data: entitlements }, { data: hires }] = await Promise.all([
    supabase.from("agent_catalog").select("id, slug, name, department_name, summary, version, visibility, price_key, capabilities").eq("active", true).order("department_name"),
    supabase.from("lanes").select("id, name, departments(name)").order("name"),
    supabase.from("agent_entitlements").select("catalog_agent_id"),
    supabase.from("agents").select("catalog_agent_id").not("catalog_agent_id", "is", null),
  ]);
  const { error } = await searchParams;
  const entitled = new Set((entitlements ?? []).map((row) => row.catalog_agent_id));
  const installed = new Set((hires ?? []).map((row) => row.catalog_agent_id));

  return (
    <section className="product-page shell" data-archetype="B2-C">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Hire for the role.
        </h1>
        <p className="text-base text-text-muted font-body">
          Every agent arrives with a six-file identity and a declared model-capability fit. Premium files stay protected while outputs remain yours.
        </p>
      </div>

      {error ? (
        <p className="form-error mb-6" role="alert">
          {error === "entitlement"
            ? "Purchase this protected configuration before hiring it."
            : "Agent could not be hired."}
        </p>
      ) : null}

      {!lanes?.length ? (
        <div className="p-4 border border-amber/40 bg-amber/10 rounded-md text-sm font-body text-text mb-6">
          Create at least one lane in <Link href="/app/builder" className="text-cyan hover:underline font-semibold">Departments</Link> before hiring.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {catalog?.map((agent) => {
          const canHire = agent.visibility === "free" || entitled.has(agent.id);
          const matchingLanes = (lanes ?? []).filter(
            (lane) => (lane.departments as { name?: string } | null)?.name === agent.department_name
          );

          return (
            <PrelineCard
              key={agent.id}
              kicker={`${agent.department_name} · v${agent.version}`}
              title={agent.name}
              badge={
                <FlowbiteBadge color={agent.visibility === "premium" ? "pink" : "cyan"} size="sm">
                  {agent.visibility === "premium" ? "Protected" : "Open core"}
                </FlowbiteBadge>
              }
              subtitle={agent.summary}
              footer={
                <div className="w-full flex items-center justify-between">
                  <span className="font-mono text-xs text-text-faint">
                    {Array.isArray(agent.capabilities) ? agent.capabilities.join(" · ") : "text"}
                  </span>
                  <div>
                    {installed.has(agent.id) ? (
                      <span className="font-mono text-xs text-lime">✓ Hired</span>
                    ) : canHire && matchingLanes.length ? (
                      <form action={hireCatalogAgent} className="inline-form gap-2">
                        <input type="hidden" name="catalog_agent_id" value={agent.id} />
                        <select name="lane_id" required className="bg-bg border border-border text-xs rounded-sm p-1">
                          {matchingLanes.map((lane) => (
                            <option value={lane.id} key={lane.id}>
                              {lane.name}
                            </option>
                          ))}
                        </select>
                        <button className="button button-primary text-xs py-1" type="submit">
                          Hire
                        </button>
                      </form>
                    ) : canHire ? (
                      <Link className="button button-outline text-xs" href="/app/builder">
                        Create lane
                      </Link>
                    ) : (
                      <Link className="button button-outline text-xs" href="/app/billing">
                        Unlock
                      </Link>
                    )}
                  </div>
                </div>
              }
            >
              <div className="space-y-2 text-xs font-body text-text-muted">
                <p>Specialized agent configuration for {agent.department_name} production workflows.</p>
              </div>
            </PrelineCard>
          );
        })}
      </div>
    </section>
  );
}
