export type GenPlayShot = { shot_number: number; prompt: string; duration_ms: number };

export function parseGenPlayShots(value: string): GenPlayShot[] {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed: unknown = JSON.parse(cleaned);
  const rows = Array.isArray(parsed) ? parsed : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { shots?: unknown }).shots) ? (parsed as { shots: unknown[] }).shots : null;
  if (!rows?.length || rows.length > 200) throw new Error("GenPlay must contain 1–200 shots");
  return rows.map((row, index) => {
    if (typeof row !== "object" || row === null) throw new Error("Invalid GenPlay shot");
    const item = row as Record<string, unknown>;
    const prompt = typeof item.prompt === "string" ? item.prompt.trim() : "";
    const duration = Number(item.duration_ms);
    if (prompt.length < 10 || prompt.length > 20_000 || !Number.isInteger(duration) || duration < 250 || duration > 60_000) throw new Error("Invalid GenPlay shot fields");
    return { shot_number: index + 1, prompt, duration_ms: duration };
  });
}
