import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Assets" };

export default async function AssetsPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ count: dna, error: dnaError }, { count: files, error: filesError }, { count: genplays, error: genplaysError }] = await Promise.all([
    supabase.from("dna_records").select("id", { count: "exact", head: true }),
    supabase.from("generated_assets").select("id", { count: "exact", head: true }),
    supabase.from("genplay_masters").select("id", { count: "exact", head: true }),
  ]);

  const loadError = dnaError || filesError || genplaysError;
  return <section className="product-page shell" data-archetype="B2-C"><h1>Assets.</h1><p className="lede">Continuity, production contracts, and finished files in one library.</p>{loadError ? <p className="form-error" role="alert">Some asset counts could not load. Refresh to try again.</p> : null}<div className="grid channel-grid">
    <Link className="card channel-card" href="/app/universe"><span className="channel-tag">{dnaError ? "—" : dna ?? 0} records</span><h2>DNA & Universe</h2><p>Characters, locations, props, visual anchors, and continuity.</p></Link>
    <Link className="card channel-card" href="/app/genplay"><span className="channel-tag">{genplaysError ? "—" : genplays ?? 0} masters</span><h2>GenPlay</h2><p>Locked production contracts and validated binders.</p></Link>
    <article className="card channel-card"><span className="channel-tag">{filesError ? "—" : files ?? 0} files</span><h2>Production files</h2><p>Generated-file count only. File browsing is not enabled yet.</p></article>
  </div></section>;
}
