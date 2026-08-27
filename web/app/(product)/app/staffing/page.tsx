import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Staffing" };

export default async function StaffingPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ count: lanes, error: lanesError }, { count: agents, error: agentsError }, { count: available, error: availableError }] = await Promise.all([
    supabase.from("lanes").select("id", { count: "exact", head: true }),
    supabase.from("agents").select("id", { count: "exact", head: true }),
    supabase.from("agent_catalog").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  const loadError = lanesError || agentsError || availableError;
  return <section className="product-page shell" data-archetype="B1-B"><h1>Staffing.</h1><p className="lede">Build internal teams. Review specialist agents available to hire.</p>{loadError ? <p className="form-error" role="alert">Some staffing data could not load. Refresh to try again.</p> : null}<div className="grid channel-grid">
    <Link className="card channel-card" href="/app/builder"><span className="channel-tag">{agentsError ? "—" : agents ?? 0} agents · {lanesError ? "—" : lanes ?? 0} teams</span><h2>Team</h2><p>Manage department lanes, roles, and agent working files.</p></Link>
    <Link className="card channel-card" href="/app/agents"><span className="channel-tag">{availableError ? "—" : available ?? 0} available</span><h2>Applications</h2><p>Review agent capabilities, entitlements, and role fit before hiring.</p></Link>
  </div></section>;
}
