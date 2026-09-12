export const SITE_CONTENT_KINDS = ["banner", "tip", "promotion", "training", "document", "image"] as const;
export const SITE_CONTENT_AUDIENCES = ["public", "member"] as const;
export type SiteContentKind = (typeof SITE_CONTENT_KINDS)[number];
export type SiteContentAudience = (typeof SITE_CONTENT_AUDIENCES)[number];
export type SiteContentStatus = "draft" | "published" | "archived";

export type SiteContentInput = Readonly<{ kind: SiteContentKind; placement: string; audience: SiteContentAudience; title: string; body: string; ctaLabel: string | null; ctaUrl: string | null; mediaPath: string | null; altText: string | null; startsAt: string | null; endsAt: string | null }>;
export type PublishedSiteContent = Readonly<{ id: string; kind: SiteContentKind; placement: string; audience: SiteContentAudience; status: SiteContentStatus; title?: string; body?: string; cta_label?: string | null; cta_url?: string | null; media_path?: string | null; media_url?: string | null; alt_text?: string | null; starts_at: string | null; ends_at: string | null; published_at?: string | null }>;

const SAFE_PLACEMENT = /^[a-z0-9][a-z0-9-]{0,63}$/;
const PRIVATE_HOST = /^(?:localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/i;

function text(value: FormDataEntryValue | null, max: number, required = false) {
  const result = String(value ?? "").trim();
  return (!result && !required) || (result.length > 0 && result.length <= max) ? result || null : null;
}

function date(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(raw) ? `${raw}Z` : raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function safeEditorialUrl(value: string | null | undefined) {
  if (!value || value.length > 2_048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !PRIVATE_HOST.test(url.hostname) && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}

export function contentInputFromForm(formData: FormData): SiteContentInput | null {
  for (const [field, max] of [["cta_label", 80], ["media_path", 512], ["alt_text", 500]] as const) {
    if (String(formData.get(field) ?? "").trim().length > max) return null;
  }
  const kind = String(formData.get("kind") ?? "");
  const placement = String(formData.get("placement") ?? "").trim();
  const audience = String(formData.get("audience") ?? "");
  const title = text(formData.get("title"), 160, true);
  const body = text(formData.get("body"), 12_000, true);
  const ctaLabel = text(formData.get("cta_label"), 80);
  const rawUrl = String(formData.get("cta_url") ?? "").trim();
  const ctaUrl = rawUrl ? safeEditorialUrl(rawUrl) : null;
  const mediaPath = text(formData.get("media_path"), 512);
  const altText = text(formData.get("alt_text"), 500);
  const startsAt = date(formData.get("starts_at"));
  const endsAt = date(formData.get("ends_at"));
  if (!(SITE_CONTENT_KINDS as readonly string[]).includes(kind) || !SAFE_PLACEMENT.test(placement) || !(SITE_CONTENT_AUDIENCES as readonly string[]).includes(audience) || !title || !body || (rawUrl && !ctaUrl) || startsAt === undefined || endsAt === undefined || (startsAt && endsAt && startsAt >= endsAt) || (mediaPath && !/^site-editorial\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp|pdf)$/i.test(mediaPath)) || ((kind === "image" || kind === "document") && (!mediaPath || !altText))) return null;
  return { kind: kind as SiteContentKind, placement, audience: audience as SiteContentAudience, title, body, ctaLabel, ctaUrl, mediaPath, altText, startsAt, endsAt };
}

export function effectiveContent<T extends PublishedSiteContent>(records: readonly T[], placement: string, audience: SiteContentAudience, now = new Date()) {
  return records.filter((record) => record.status === "published" && record.placement === placement && record.audience === audience && (!record.starts_at || new Date(record.starts_at) <= now) && (!record.ends_at || new Date(record.ends_at) > now)).sort((left, right) => String(left.published_at ?? "").localeCompare(String(right.published_at ?? "")));
}
