import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listStorageFiles(admin: SupabaseClient, bucket: string, prefix: string) {
  const files: string[] = [];
  async function visit(path: string) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await admin.storage.from(bucket).list(path, { limit: 1000, offset });
      if (error) throw new Error("Could not list private media");
      for (const item of data ?? []) {
        const itemPath = `${path}/${item.name}`;
        if (item.id) files.push(itemPath); else await visit(itemPath);
      }
      if (!data || data.length < 1000) break;
    }
  }
  await visit(prefix);
  return files;
}

export async function removeStorageFiles(admin: SupabaseClient, bucket: string, files: string[]) {
  for (let index = 0; index < files.length; index += 100) {
    const { error } = await admin.storage.from(bucket).remove(files.slice(index, index + 100));
    if (error) throw new Error("Could not delete private media");
  }
}
