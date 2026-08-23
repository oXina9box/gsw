import { describe, expect, it } from "vitest";
import { evaluateConditions, mapPayload, mergeDocumentSet, normalizeDocumentSet, nextRoundTablePass, validateConditions, validatePassOrder } from "../../lib/orchestration/engine";

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

describe("validateConditions", () => {
  it("accepts unrestricted and supported conditions", () => {
    expect(validateConditions(null)).toEqual([]);
    expect(validateConditions([{ field: "status", value: "approved" }, { field: "score", op: "neq", value: 7 }, { field: "owner", op: "exists" }])).toEqual([]);
  });
  it("reports malformed conditions", () => {
    expect(validateConditions({ field: "status" })).toEqual(["Conditions must be a JSON array."]);
    expect(validateConditions([{ field: "status", op: "equals", value: "approved" }])).toEqual(["Condition 1 operator must be one of: eq, neq, exists."]);
    expect(validateConditions(["status"])).toEqual(["Condition 1 must be an object."]);
  });
});

describe("document chain", () => {
  it("normalizes and merges documents without losing upstream work", () => {
    expect(normalizeDocumentSet([{ id: "brief", content: "seed" }, { id: "brief", content: "ignored" }, { id: "empty" }])).toEqual([{ id: "brief", content: "seed" }]);
    expect(mergeDocumentSet([{ id: "brief", content: "seed" }], [{ id: "script", content: "draft" }, { id: "brief", content: "revised" }])).toEqual([
      { id: "brief", content: "revised" },
      { id: "script", content: "draft" },
    ]);
  });

  it("rejects malformed document sets", () => {
    expect(normalizeDocumentSet(null)).toEqual([]);
    expect(normalizeDocumentSet([{ id: "", content: "x" }, "bad"])).toEqual([]);
  });
});

describe("lane collaboration", () => {
  it("accepts bounded round-table order and rejects invalid settings", () => {
    expect(validatePassOrder("round_table", [0, 1, 2], 3)).toEqual([]);
    expect(validatePassOrder("round_table", [], 1).length).toBeGreaterThan(0);
    expect(validatePassOrder("round_table", [0], 21).length).toBeGreaterThan(0);
    expect(validatePassOrder("forward", [], 0)).toEqual([]);
    expect(nextRoundTablePass({ passOrder: [1, 2, 0], cycle: 0, pass: 1 })).toEqual({ agentPosition: 0, cycle: 0, pass: 2 });
    expect(nextRoundTablePass({ passOrder: [1, 2, 0], cycle: 0, pass: 2 })).toEqual({ agentPosition: 1, cycle: 1, pass: 0 });
  });
});
