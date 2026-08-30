import Link from "next/link";
import { createDnaRecord } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";

export const metadata = { title: "Private Universe" };

export default async function UniversePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tier?: string; group?: string }>;
}) {
  const { supabase } = await getWorkspaceContext();
  const params = await searchParams;
  let query = supabase
    .from("dna_records")
    .select("id, dna_id, dna_type, status, schema_version, version, locked, tier, group_type, record, updated_at")
    .order("updated_at", { ascending: false });

  if (params.tier === "A" || params.tier === "B") query = query.eq("tier", params.tier);
  if (["Universe", "Studio", "Channel", "Season", "Socials", "FDNA"].includes(params.group ?? "")) {
    query = query.eq("group_type", params.group);
  }
  const { data: records } = await query;
  const { error } = params;

  return (
    <section className="product-page shell" data-archetype="B2-C">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Continuity has a memory.
        </h1>
        <p className="text-base text-text-muted font-body">
          Create versioned DNA once; cast same identity across productions.
        </p>
      </div>

      {error ? <p className="form-error mb-6" role="alert">DNA operation failed.</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <PrelineCard
            kicker="Continuity Lock"
            title="Create DNA Record"
            subtitle="Spawn character, location, or prop DNA"
          >
            <form action={createDnaRecord} className="stack-form">
              <label>
                Record type
                <select name="dna_type" defaultValue="CDNA">
                  <option value="CDNA">Character DNA (cDNA)</option>
                  <option value="LDNA">Location DNA (lDNA)</option>
                  <option value="PDNA">Prop DNA (pDNA)</option>
                </select>
              </label>
              <label>
                Group
                <select name="group_type" defaultValue="Universe">
                  {["Universe", "Studio", "Channel", "Season", "Socials", "FDNA"].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </label>
              <label>
                DNA Identifier
                <input name="dna_id" placeholder="CHAR-LEAD-01" required maxLength={64} />
              </label>
              <label>
                Character / Asset Name
                <input name="name" placeholder="Captain Vesper" maxLength={120} />
              </label>
              <label>
                Continuity Summary
                <textarea name="summary" placeholder="Visual attributes, costume anchors, color tokens..." rows={3} />
              </label>
              <label>
                Visual Anchors (comma-separated)
                <input name="anchors" placeholder="Cybernetic eye, leather duster, cyan scar" />
              </label>
              <button className="button button-primary" type="submit">
                Create Record
              </button>
            </form>
          </PrelineCard>
        </div>

        <div className="lg:col-span-7">
          <PrelineCard
            kicker="Continuity Registry"
            title="DNA Library"
            subtitle={`${records?.length ?? 0} active continuity records`}
          >
            {records?.length ? (
              <div className="divide-y divide-border-2">
                {records.map((rec) => {
                  const body = rec.record as { name?: string; summary?: string } | null;
                  return (
                    <Link
                      key={rec.id}
                      href={`/app/universe/${rec.id}`}
                      className="py-3 flex items-center justify-between hover:bg-surface-2 p-2 rounded-sm transition-colors duration-150"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="font-display text-sm font-semibold text-text">
                            {body?.name || rec.dna_id}
                          </strong>
                          <FlowbiteBadge color={rec.tier === "A" ? "lime" : "cyan"} size="sm">
                            {rec.tier}-tier
                          </FlowbiteBadge>
                          {rec.locked && <span className="font-mono text-[10px] text-amber">🔒 locked</span>}
                        </div>
                        <span className="font-mono text-xs text-text-faint">
                          {rec.dna_type} · v{rec.version} · {rec.group_type}
                        </span>
                      </div>
                      <span className="text-cyan font-mono text-xs">Inspect →</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">No DNA continuity records found.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
