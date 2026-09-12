import { saveSiteContent, setSiteContentPublication, restoreSiteContentRevision } from "@/app/(product)/site-content-actions";

type Item = Record<string, string | number | null | undefined>;
export function ContentEditor({ item, revisions = [] }: { item?: Item; revisions?: Item[] }) {
  return <div className="space-y-4">
    {typeof item?.media_url === "string" && (item.kind === "document" ? <a className="text-sm text-cyan" href={item.media_url} target="_blank" rel="noopener noreferrer">Preview document</a> : (
      // eslint-disable-next-line @next/next/no-img-element -- Private expiring preview bypasses the shared optimizer cache.
      <img src={item.media_url} alt={String(item.alt_text ?? item.title ?? "")} className="max-h-64 max-w-full object-contain" />
    ))}
    {item && <div className="border border-border bg-surface-2 p-4" aria-label="Safe content preview"><p className="font-mono text-xs uppercase text-pink">Preview · {item.placement}</p><h4 className="font-display text-lg font-semibold">{item.title}</h4><p className="text-sm text-text-muted whitespace-pre-wrap">{item.body}</p>{item.cta_url && <span className="text-xs text-cyan">{item.cta_label ?? "Learn more"} · {item.cta_url}</span>}</div>}
    <form action={saveSiteContent} className="stack-form" encType="multipart/form-data">
      <input type="hidden" name="id" value={item?.id ?? ""} /><input type="hidden" name="revision" value={item?.revision ?? 0} />
      <label>Kind<select name="kind" defaultValue={item?.kind ?? "tip"}>{["banner","tip","promotion","training","document","image"].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Placement<select name="placement" defaultValue={item?.placement ?? "studio-sidebar"}><option value="studio-sidebar">Studio sidebar (member audience)</option><option value="homepage">Homepage (public audience)</option><option value="docs">Documentation (public audience)</option></select></label>
      <label>Audience<select name="audience" defaultValue={item?.audience ?? "member"}><option>public</option><option>member</option></select></label>
      <label>Title<input name="title" maxLength={160} defaultValue={item?.title ?? ""} required /></label>
      <label>Body<textarea name="body" maxLength={12000} defaultValue={item?.body ?? ""} required /></label>
      <label>CTA label<input name="cta_label" maxLength={80} defaultValue={item?.cta_label ?? ""} /></label>
      <label>CTA URL<input name="cta_url" type="url" defaultValue={item?.cta_url ?? ""} placeholder="https://…" /></label>
      <label>Media file<input name="media_file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" /></label>
      <label>Existing media path<input name="media_path" defaultValue={item?.media_path ?? ""} /></label>
      <label>Alt text<input name="alt_text" maxLength={500} defaultValue={item?.alt_text ?? ""} /></label>
      <label>Starts at (UTC)<input name="starts_at" type="datetime-local" defaultValue={item?.starts_at ? new Date(item.starts_at).toISOString().slice(0,16) : ""} /></label>
      <label>Ends at (UTC)<input name="ends_at" type="datetime-local" defaultValue={item?.ends_at ? new Date(item.ends_at).toISOString().slice(0,16) : ""} /></label>
      <label>Reason<input name="reason" minLength={3} maxLength={2000} required placeholder="Why is this change needed?" /></label>
      <button className="button button-primary" type="submit">{item ? "Save revision" : "Create content"}</button>
    </form>
    {item && <div className="flex flex-wrap gap-2"><form action={setSiteContentPublication} className="flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={item.id ?? ""}/><input type="hidden" name="revision" value={item.revision ?? 0}/><input type="hidden" name="publish" value={item.status !== "published" ? "true" : "false"}/><input name="reason" aria-label="Publication reason" minLength={3} maxLength={2000} required placeholder="Reason"/><button className="button button-outline" type="submit">{item.status === "published" ? "Unpublish" : "Publish"}</button></form></div>}
    {revisions.length > 0 && <details><summary>Revision history</summary><div className="space-y-2 pt-2">{revisions.map((revision) => <form action={restoreSiteContentRevision} key={String(revision.revision)} className="flex flex-wrap items-center gap-2"><span>Revision {revision.revision}</span><input type="hidden" name="id" value={item?.id ?? ""}/><input type="hidden" name="source_revision" value={revision.revision ?? 0}/><input type="hidden" name="revision" value={item?.revision ?? 0}/><input type="hidden" name="reason" value={`Restore revision ${revision.revision}`}/><button className="button button-outline text-xs" type="submit">Restore</button></form>)}</div></details>}
  </div>;
}
