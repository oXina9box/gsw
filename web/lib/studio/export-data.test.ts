import { describe, expect, it } from "vitest";
import { DATA_EXPORT_TABLES } from "./export-data";

describe("account export inventory", () => {
  it("includes continuity records and their production casting links", () => {
    expect(DATA_EXPORT_TABLES).toEqual(expect.arrayContaining(["dna_records", "production_dna"]));
  });
});
