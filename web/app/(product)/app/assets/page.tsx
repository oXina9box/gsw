import Link from "next/link";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "Assets" };

export default async function AssetsPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ count: dna, error: dnaError }, { count: files, error: filesError }, { count: genplays, error: genplaysError }] = await Promise.all([
    supabase.from("dna_records").select("id", { count: "exact", head: true }),
    supabase.from("generated_assets").select("id", { count: "exact", head: true }),
    supabase.from("genplay_masters").select("id", { count: "exact", head: true }),
  ]);

  const loadError = dnaError || filesError || genplaysError;

  return (
    <section className="product-page shell" data-archetype="B2-C">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Assets.
        </h1>
        <p className="text-base text-text-muted font-body">
          Continuity, production contracts, and finished files in one library.
        </p>
      </div>

      {loadError ? (
        <p className="form-error mb-6" role="alert">
          Some asset counts could not load. Refresh to try again.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/app/universe" className="block group">
          <PrelineCard
            kicker={`${dnaError ? "—" : dna ?? 0} records`}
            title="DNA & Universe"
            subtitle="Characters, locations, props, visual anchors, and continuity"
            footer={<span className="text-cyan group-hover:underline">Open Universe →</span>}
            className="h-full group-hover:border-cyan transition-colors duration-150"
          >
            <p className="text-sm text-text-muted font-body">
              Maintain continuity profiles (cDNA, lDNA, pDNA) across all production episodes to prevent visual drift.
            </p>
          </PrelineCard>
        </Link>

        <Link href="/app/studio" className="block group">
          <PrelineCard
            kicker={`${genplaysError ? "—" : genplays ?? 0} masters`}
            title="GenPlay Contracts"
            subtitle="Locked production contracts and validated binders"
            footer={<span className="text-cyan group-hover:underline">View Floor →</span>}
            className="h-full group-hover:border-cyan transition-colors duration-150"
          >
            <p className="text-sm text-text-muted font-body">
              Inspect immutable generation parameters, prompt templates, and frame specifications.
            </p>
          </PrelineCard>
        </Link>

        <div className="block">
          <PrelineCard
            kicker={`${filesError ? "—" : files ?? 0} files`}
            title="Production files"
            subtitle="Generated-file count only. File browsing is not enabled yet."
            className="h-full"
          >
            <p className="text-sm text-text-muted font-body">
              Vault storage for raw video takes, intermediate audio stems, and assembled master cuts.
            </p>
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
