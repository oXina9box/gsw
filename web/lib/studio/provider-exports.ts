import type { GenPlayShot } from "./genplay";

export type ProviderExport = "midjourney" | "runway" | "pika" | "elevenlabs";

/** Format one GenPlay shot for copy/paste into common off-site tools. */
export function formatProviderExport(provider: ProviderExport, shot: GenPlayShot): string {
  const duration = `${Math.round(shot.duration_ms / 1000)}s`;
  if (provider === "midjourney") return `${shot.prompt} --ar 16:9 --style raw --no text, watermark`;
  if (provider === "runway") return `Duration: ${duration}\nAspect ratio: 16:9\nPrompt: ${shot.prompt}`;
  if (provider === "pika") return `${shot.prompt}\nDuration: ${duration}\nFormat: 16:9`;
  return `Voiceover direction for shot ${shot.shot_number} (${duration}): ${shot.prompt}`;
}

