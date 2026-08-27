import Link from "next/link";
import { hireCatalogAgent } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Agent Hiring" };

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
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
  return <section className="product-page shell" data-archetype="B2-C">
    <h1>Hire for the role.</h1>
    <p className="lede">Every agent arrives with a six-file identity and a declared model-capability fit. Premium files stay protected while outputs remain yours.</p>
    {error ? <p className="form-error" role="alert">{error === "entitlement" ? "Purchase this protected configuration before hiring it." : "Agent could not be hired."}</p> : null}
    {!lanes?.length ? <div className="notice">Create at least one lane in <Link href="/app/builder">Departments</Link> before hiring.</div> : null}
    <div className="catalog-list">{catalog?.map((agent) => {
      const canHire = agent.visibility === "free" || entitled.has(agent.id);
      const matchingLanes = (lanes ?? []).filter((lane) => (lane.departments as { name?: string } | null)?.name === agent.department_name);
      return <article className="catalog-row" key={agent.id}>
        <div><span className="channel-tag">{agent.department_name} · v{agent.version}</span><h2>{agent.name}</h2><p className="muted">{agent.summary}</p><p className="capability-list">{Array.isArray(agent.capabilities) ? agent.capabilities.join(" · ") : "text"}</p></div>
        <div className="catalog-action">
          <span className={`status-mark ${agent.visibility}`}>{agent.visibility === "premium" ? "Protected" : "Open core"}</span>
          {installed.has(agent.id) ? <span className="muted">Hired</span> : canHire && matchingLanes.length ? <form action={hireCatalogAgent} className="inline-form"><input type="hidden" name="catalog_agent_id" value={agent.id} /><label>Lane<select name="lane_id" required>{matchingLanes.map((lane) => <option value={lane.id} key={lane.id}>{agent.department_name} / {lane.name}</option>)}</select></label><button className="button button-primary" type="submit">Hire</button></form> : canHire ? <Link className="button button-outline" href="/app/builder">Create {agent.department_name} lane</Link> : <Link className="button button-outline" href="/app/billing">Unlock</Link>}
        </div>
      </article>;
    })}</div>
  </section>;
}
