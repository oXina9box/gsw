export type CastingRecord = { record?: Record<string, unknown> | null };

const words = (value: unknown) => String(value ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? [];

/** Deterministic, explainable fit score for casting triage (0-100). */
export function castingFitScore(brief: string, candidate: CastingRecord): number {
  const source = new Set(words(brief));
  if (!source.size) return 0;
  const record = candidate.record ?? {};
  const fields = ["look", "feel", "persona", "lore", "summary", "anchors", "voice_behavior"];
  const matches = fields.flatMap((field) => words(record[field])).filter((word) => source.has(word));
  return Math.min(100, Math.round((new Set(matches).size / source.size) * 100));
}
