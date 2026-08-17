import { createClient } from "@/lib/supabase/server";
import { DataSummary } from "@/components/product/data-summary";
import Link from "next/link";
export const metadata = { title: "Workspace" };

export default async function AppPage() {
  const supabase = await createClient();
  const { data: memberships } = await supabase.from("workspace_members").select("workspace_id, role, workspaces(id, name)").order("created_at").limit(1);
  const membership = memberships?.[0];
  const [{ count: channels }, { count: productions }, { count: dna }, { count: assets }] = await Promise.all([
    supabase.from("channels").select("id", { count: "exact", head: true }),
    supabase.from("productions").select("id", { count: "exact", head: true }),
    supabase.from("dna_records").select("id", { count: "exact", head: true }),
    supabase.from("generated_assets").select("id", { count: "exact", head: true }),
  ]);
  const workspaceRecord = membership?.workspaces as { name?: unknown } | null | undefined;
  const workspace = typeof workspaceRecord?.name === "string" ? workspaceRecord.name : "Your workspace";
  return <section className="product-page shell"><p className="kicker">Authenticated workspace</p><h1>{workspace}</h1><p className="lede">Your private creative floor. Demo records are intentionally absent.</p><DataSummary channels={channels ?? 0} productions={productions ?? 0} dna={dna ?? 0} assets={assets ?? 0} /><div className="panel"><h2>Workspace overview</h2><p className="muted">Start with a channel, then move a production through the connected creative departments.</p><div className="actions"><Link className="button button-primary" href="/app/channels">Open channels</Link><Link className="button button-outline" href="/app/builder">Open builder</Link><Link className="button button-outline" href="/app/dna">DNA registry</Link><Link className="button button-outline" href="/app/genplay">GenPlay</Link><Link className="button button-outline" href="/account">Account settings</Link></div></div></section>;
}
