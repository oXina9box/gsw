import { createAdminClient } from "@/lib/supabase/admin";
import { DATA_EXPORT_TABLES } from "@/lib/studio/export-data";
import { listStorageFiles } from "@/lib/studio/storage";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, workspaceId, workspaceName } = await getWorkspaceContext();
  const data: Record<string, unknown[]> = {};
  for (const table of DATA_EXPORT_TABLES) {
    const records: unknown[] = [];
    for (let from = 0; ; from += 1000) {
      const pageEnd = from + 999;
      const { data: page, error } = await supabase.from(table).select("*").range(from, pageEnd);
      if (error) return Response.json({ error: `Export failed at ${table}` }, { status: 500 });
      records.push(...(page ?? []));
      if (!page || page.length < 1000) break;
    }
    data[table] = records;
  }
  const [{ data: profile, error: profileError }, { data: workspace, error: workspaceError }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, created_at, updated_at").eq("id", user.id).single(),
    supabase.from("workspaces").select("id, name, slug, created_at, updated_at").eq("id", workspaceId).single(),
  ]);
  if (profileError || workspaceError) return Response.json({ error: "Export identity manifest failed" }, { status: 500 });
  const admin = createAdminClient();
  const paths = await listStorageFiles(admin, "creative-assets", `workspace/${workspaceId}`);
  const media: { path: string; download_url: string | null }[] = [];
  // ponytail: path/audience binding via workspace prefix, per-object audience token if needed after rehearsal
  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);
    const { data: links, error } = await admin.storage.from("creative-assets").createSignedUrls(batch, 300);
    if (error) return Response.json({ error: "Export media manifest failed" }, { status: 500 });
    media.push(...batch.map((path, offset) => ({ path, download_url: links?.[offset]?.signedUrl ?? null })));
  }
  const payload = { exported_at: new Date().toISOString(), media_links_expire_in_seconds: 300, account: { id: user.id, email: user.email, profile }, workspace: { id: workspaceId, name: workspaceName, record: workspace }, data, media };
  const filename = `gem-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(payload, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "private, no-store" } });
}
