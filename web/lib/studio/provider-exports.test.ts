import { describe, expect, it } from "vitest";
import { formatProviderExport } from "./provider-exports";

const shot = { shot_number: 2, prompt: "A fox runs through a neon forest", duration_ms: 4000 };

describe("formatProviderExport", () => {
  it("formats each supported provider", () => {
    expect(formatProviderExport("midjourney", shot)).toContain("--ar 16:9");
    expect(formatProviderExport("runway", shot)).toContain("Duration: 4s");
    expect(formatProviderExport("pika", shot)).toContain("Format: 16:9");
    expect(formatProviderExport("elevenlabs", shot)).toContain("Voiceover direction");
  });
});

