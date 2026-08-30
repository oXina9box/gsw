import { notFound } from "next/navigation";
import { promoteDnaRecord, updateDnaRecord } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { PrelineCard } from "@/components/blocks/preline/preline-card";

export const metadata = { title: "DNA record" };

type DnaRecord = {
  id: string;
  dna_id: string;
  dna_type: string;
  status: string;
  schema_version: string;
  version: number;
  locked: boolean;
  tier: "A" | "B";
  group_type: string;
  record: { name?: string; summary?: string; anchors?: string[]; voice_behavior?: string } | null;
};

export default async function DnaRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase
    .from("dna_records")
    .select("id, dna_id, dna_type, status, schema_version, version, locked, tier, group_type, record")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const record = data as DnaRecord | null;
  if (!record) notFound();
  const { error } = await searchParams;
  const body = record.record;

  return (
    <section className="product-page shell" data-archetype="B2-B">
      <div className="mb-4">
        <FlowbiteBreadcrumb
          homeHref="/app"
          homeLabel="Studio"
          items={[
            { label: "Universe", href: "/app/universe" },
            { label: body?.name || record.dna_id, current: true },
          ]}
        />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
            {body?.name || record.dna_id}
          </h1>
          <p className="font-mono text-xs text-text-faint mt-1">
            {record.dna_type} · {record.tier}-tier · v{record.version} · schema {record.schema_version}
            {record.locked ? " · 🔒 locked" : ""}
          </p>
        </div>
        <FlowbiteBadge color={record.tier === "A" ? "lime" : "cyan"}>
          {record.status}
        </FlowbiteBadge>
      </div>

      {error === "locked" && <p className="form-error mb-6" role="alert">This version is locked. Unlock it before changing continuity content.</p>}
      {error === "dna" && <p className="form-error mb-6" role="alert">The DNA record could not be saved.</p>}
      {error === "promotion" && <p className="form-error mb-6" role="alert">Promotion failed. Record may already be A-tier.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6">
          <PrelineCard
            kicker="Continuity Properties"
            title="Continuity Record"
            subtitle="Editable character/asset definition"
          >
            <form action={updateDnaRecord} className="stack-form">
              <input type="hidden" name="record_id" value={record.id} />
              <label>
                Continuity summary
                <textarea name="summary" maxLength={500} rows={3} defaultValue={body?.summary ?? ""} required />
              </label>
              <label>
                Visual anchors
                <input name="anchors" maxLength={500} defaultValue={body?.anchors?.join(", ") ?? ""} required />
              </label>
              <label>
                Voice / behavior
                <textarea name="voice_behavior" maxLength={500} rows={3} defaultValue={body?.voice_behavior ?? ""} />
              </label>
              <label>
                Group
                <select name="group_type" defaultValue={record.group_type}>
                  {["Universe", "Studio", "Channel", "Season", "Socials", "FDNA"].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </label>
              <label className="check-row">
                <input type="checkbox" name="lock_version" defaultChecked={record.locked} />
                Lock version {record.version}
              </label>
              <button className="button button-primary" type="submit">
                Save record
              </button>
            </form>
          </PrelineCard>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <PrelineCard
            kicker="Raw Contract"
            title="JSON Specification"
            subtitle="Full continuity schema payload"
          >
            <pre className="p-4 bg-bg border border-border rounded-sm text-xs font-mono text-text overflow-x-auto">
              {JSON.stringify(record.record, null, 2)}
            </pre>

            {record.tier === "B" && (
              <form action={promoteDnaRecord} className="stack-form pt-4 border-t border-hairline mt-4">
                <h3 className="font-display text-sm font-semibold text-text">Promote to A-tier</h3>
                <label>
                  Promotion reason
                  <textarea name="reason" maxLength={1000} required rows={2} placeholder="Explain why this DNA is production-stable" />
                </label>
                <input type="hidden" name="record_id" value={record.id} />
                <button className="button button-outline text-xs" type="submit">
                  Promote to A-tier
                </button>
              </form>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
