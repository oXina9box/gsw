/* eslint-disable @next/next/no-img-element */
import { getPublishedSiteContent } from "@/lib/site/content-server";

export async function PublishedContent({ placement, audience = "public" }: { placement: string; audience?: "public" | "member" }) {
  const items = await getPublishedSiteContent(placement, audience);
  if (!items.length) return null;
  return <section aria-label="Published studio updates" className="mx-auto max-w-screen-xl space-y-3 px-4 py-4 sm:px-6">{items.map((item) => <article key={item.id} className="rounded border border-border bg-surface p-4"><div className="flex gap-4">{item.media_url && item.kind === "image" && <img src={item.media_url} alt={item.alt_text || item.title || ""} className="h-20 w-20 rounded object-cover" />}{item.media_url && item.kind === "document" && <a href={item.media_url} className="text-sm font-bold text-cyan">Download document</a>}<div><h2 className="font-bold text-text">{item.title}</h2><p className="text-sm text-text-muted">{item.body}</p>{item.cta_url && item.cta_label && <a href={item.cta_url} className="mt-2 inline-block text-sm font-bold text-cyan">{item.cta_label}</a>}</div></div></article>)}</section>;
}
