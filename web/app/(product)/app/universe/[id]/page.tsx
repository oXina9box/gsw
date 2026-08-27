import Link from "next/link";
import { notFound } from "next/navigation";
import { promoteDnaRecord, updateDnaRecord } from "@/app/(product)/actions";
import { getWorkspaceContext } from "@/lib/studio/workspace";

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

export default async function DnaRecordPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase.from("dna_records").select("id, dna_id, dna_type, status, schema_version, version, locked, tier, group_type, record").eq("id", id).eq("workspace_id", workspaceId).maybeSingle();
  const record = data as DnaRecord | null;
  if (!record) notFound();
  const { error } = await searchParams;
  const body = record.record;

  return <section className="product-page shell" data-archetype="B2-B">
    <Link className="text-link" href="/app/universe">← Universe</Link>
    <h1>{body?.name || record.dna_id}</h1>
    <p className="muted">{record.dna_type} · {record.tier}-tier · v{record.version} · schema {record.schema_version} · <span className={`status-mark ${record.status}`}>{record.status}</span>{record.locked ? " · locked" : ""}</p>
    {error === "locked" ? <p className="form-error" role="alert">This version is locked. Unlock it before changing continuity content.</p> : null}
    {error === "dna" ? <p className="form-error" role="alert">The DNA record could not be saved.</p> : null}
    {error === "promotion" ? <p className="form-error" role="alert">Promotion failed. Record may already be A-tier.</p> : null}
    <div className="workspace-split">
      <section className="panel"><h2>Continuity record</h2>
        <form action={updateDnaRecord} className="stack-form">
          <input type="hidden" name="record_id" value={record.id} />
          <label>Continuity summary<textarea name="summary" maxLength={500} rows={3} defaultValue={body?.summary ?? ""} required /></label>
          <label>Visual anchors<input name="anchors" maxLength={500} defaultValue={body?.anchors?.join(", ") ?? ""} required /></label>
          <label>Voice / behavior<textarea name="voice_behavior" maxLength={500} rows={3} defaultValue={body?.voice_behavior ?? ""} /></label>
          <label>Group<select name="group_type" defaultValue={record.group_type}>{["Universe", "Studio", "Channel", "Season", "Socials", "FDNA"].map((group) => <option key={group}>{group}</option>)}</select></label>
          <label className="check-row"><input type="checkbox" name="lock_version" defaultChecked={record.locked} />Lock version {record.version}</label>
          <button className="button button-primary" type="submit">Save record</button>
        </form>
      </section>
      <section className="panel"><h2>Full record</h2><pre className="code-block">{JSON.stringify(record.record, null, 2)}</pre>{record.tier === "B" ? <form action={promoteDnaRecord} className="stack-form compact-form"><input type="hidden" name="record_id" value={record.id} /><label>Promotion reason<textarea name="reason" maxLength={1000} required /></label><button className="button button-outline" type="submit">Promote to A-tier</button></form> : null}</section>
    </div>
  </section>;
}
