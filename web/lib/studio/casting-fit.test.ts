import { describe, expect, it } from "vitest";
import { castingFitScore } from "./casting-fit";

describe("castingFitScore", () => {
  it("scores shared lore/persona terms and caps at 100", () => {
    expect(castingFitScore("brave pilot from mars", { record: { persona: "brave pilot", lore: "mars" } })).toBe(75);
    expect(castingFitScore("brave pilot from mars", { record: { persona: "quiet farmer" } })).toBe(0);
  });
});
