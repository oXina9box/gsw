import assert from "node:assert/strict";
import test from "node:test";

import { filterSignals } from "./signal-filter.mjs";

const signals = [
  { type: "native", title: "Cut" },
  { type: "conversation", title: "Prompt" },
  { type: "native", title: "Feedback" },
];

test("signal filters keep the editorial order", () => {
  assert.deepEqual(filterSignals(signals, "all"), signals);
  assert.deepEqual(filterSignals(signals, "native").map(({ title }) => title), ["Cut", "Feedback"]);
  assert.deepEqual(filterSignals(signals, "conversation").map(({ title }) => title), ["Prompt"]);
});
