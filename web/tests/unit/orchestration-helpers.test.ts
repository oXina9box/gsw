import { describe, expect, it } from "vitest";
import { evaluateConditions, mapPayload } from "../../lib/orchestration/engine";

describe("mapPayload", () => {
  it("maps nested values without changing the input", () => {
    const context = { brief: { title: "Moonlight" }, count: 3 };

    expect(mapPayload(context, { name: "brief.title", shots: "count" })).toEqual({
      name: "Moonlight",
      shots: 3,
    });
    expect(context).toEqual({ brief: { title: "Moonlight" }, count: 3 });
  });

  it("ignores invalid mappings and missing paths", () => {
    expect(mapPayload({ brief: null }, { missing: "brief.title", invalid: 4 })).toEqual({});
    expect(mapPayload({}, null)).toEqual({});
    expect(mapPayload({}, [])).toEqual({});
  });
});

describe("evaluateConditions", () => {
  const context = { status: "approved", metadata: { score: 8 }, owner: null };

  it("supports equality, inequality, and existence checks", () => {
    expect(evaluateConditions(context, [
      { field: "status", value: "approved" },
      { field: "metadata.score", op: "neq", value: 7 },
      { field: "metadata.score", op: "exists" },
    ])).toBe(true);
    expect(evaluateConditions(context, [{ field: "owner", op: "exists" }])).toBe(false);
  });

  it("returns false when a condition does not match", () => {
    expect(evaluateConditions(context, [{ field: "status", op: "eq", value: "draft" }])).toBe(false);
    expect(evaluateConditions(context, [{ field: "metadata.score", op: "neq", value: 8 }])).toBe(false);
  });

  it("treats an absent condition list as unrestricted", () => {
    expect(evaluateConditions(context, null)).toBe(true);
  });

  it("fails closed for malformed entries and unknown operators", () => {
    expect(evaluateConditions(context, [null])).toBe(false);
    expect(evaluateConditions(context, [{}])).toBe(false);
    expect(evaluateConditions(context, [{ field: 12 }])).toBe(false);
    expect(evaluateConditions(context, [{ field: "status", op: "equals", value: "approved" }])).toBe(false);
  });
});
