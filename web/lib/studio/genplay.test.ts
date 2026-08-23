import { describe, expect, it } from "vitest";
import { parseGenPlayShots } from "./genplay";

describe("parseGenPlayShots", () => {
  it("normalizes valid fenced output and owns shot numbering", () => {
    expect(parseGenPlayShots('```json\n{"shots":[{"shot_number":99,"prompt":"Wide orbital establishing shot","duration_ms":2500}]}\n```')).toEqual([{ shot_number: 1, prompt: "Wide orbital establishing shot", duration_ms: 2500 }]);
  });

  it("rejects malformed or unsafe shot contracts", () => {
    expect(() => parseGenPlayShots('{"shots":[]}')).toThrow();
    expect(() => parseGenPlayShots('{"shots":[{"prompt":"short","duration_ms":100}]}')).toThrow();
  });
});
