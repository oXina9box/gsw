"use client";

import { useEffect, useState } from "react";
import { safeEditorialUrl, type PublishedSiteContent } from "@/lib/site/content";

export function SiteTipSlot({ items }: { items: readonly PublishedSiteContent[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const many = items.length > 1;
  useEffect(() => {
    if (!many || paused || hovered || focused) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!document.hidden && !motion.matches) setIndex((value) => (value + 1) % items.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [many, paused, hovered, focused, items.length]);
  if (!items.length) return null;
  const item = items[index] ?? items[0];
  const cta = safeEditorialUrl(item.cta_url);
  const media = safeEditorialUrl(item.media_url);
  return <aside className="relative mb-3 space-y-2 overflow-hidden rounded-sm border border-cyan/20 bg-cyan/5 px-3 py-3" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} aria-label="Studio update" aria-roledescription={many ? "carousel" : undefined}>
    {/* eslint-disable-next-line @next/next/no-img-element -- Private signed editorial media expires; no optimizer cache. */}
    {media && item.kind !== "document" && <img src={media} alt={item.alt_text || item.title || ""} className="h-20 w-full rounded-sm object-cover" />}
    <div className="min-w-0 flex-1"><p className="font-bold text-text">{item.title}</p><p className="text-sm text-text-muted">{item.body}</p>{cta && item.cta_label && <a href={cta} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-bold text-cyan">{item.cta_label}</a>}</div>
    {media && item.kind === "document" && <a href={media} className="text-sm text-cyan">Download document</a>}
    {many && <div className="flex items-center justify-between gap-1">
      <button className="min-h-9 min-w-9" type="button" onClick={() => setIndex((index - 1 + items.length) % items.length)} aria-label="Previous update">←</button>
      <button className="min-h-9 min-w-9" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Play updates" : "Pause updates"}>{paused ? "▶" : "Ⅱ"}</button>
      <button className="min-h-9 min-w-9" type="button" onClick={() => setIndex((index + 1) % items.length)} aria-label="Next update">→</button>
    </div>}
  </aside>;
}
