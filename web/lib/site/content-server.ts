import "server-only";
import { createClient } from "@/lib/supabase/server";
import { effectiveContent, safeEditorialUrl, type PublishedSiteContent, type SiteContentAudience } from "./content";

export async function getPublishedSiteContent(placement: string, audience: SiteContentAudience = "public"): Promise<PublishedSiteContent[]> {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(placement)) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_content_items")
    .select("id, kind, placement, audience, status, title, body, cta_label, cta_url, media_path, alt_text, starts_at, ends_at, published_at")
    .eq("placement", placement).eq("audience", audience).eq("status", "published").order("published_at", { ascending: false }).limit(50);
  if (error) {
    console.error("Published site content could not load", { code: error.code });
    return [];
  }
  const items = effectiveContent((data ?? []) as PublishedSiteContent[], placement, audience);
  return Promise.all(items.map(async (item) => {
    const safe = { ...item, cta_url: safeEditorialUrl(item.cta_url) };
    if (!item.media_path) return safe;
    const { data: media, error: mediaError } = await supabase.storage.from("site-editorial").createSignedUrl(item.media_path, 300);
    if (mediaError) console.error("Published editorial media could not load", { code: mediaError.name });
    return { ...safe, media_url: mediaError ? null : media?.signedUrl ?? null };
  }));
}
