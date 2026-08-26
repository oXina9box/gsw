"use client";

import { useState } from "react";
import { formatProviderExport, type ProviderExport } from "@/lib/studio/provider-exports";
import type { GenPlayShot } from "@/lib/studio/genplay";

const providers: ProviderExport[] = ["midjourney", "runway", "pika", "elevenlabs"];

export function ProviderExportButtons({ shot }: { shot: GenPlayShot }) {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(provider: ProviderExport) {
    await navigator.clipboard.writeText(formatProviderExport(provider, shot));
    setCopied(provider);
    window.setTimeout(() => setCopied(null), 1500);
  }
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.75rem" }} aria-label="Provider exports">
    {providers.map((provider) => <button key={provider} type="button" className="button button-outline" onClick={() => copy(provider)} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>{copied === provider ? "Copied" : `Copy ${provider}`}</button>)}
  </div>;
}

