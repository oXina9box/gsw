/** @template {{ type: "native" | "conversation" }} T */
/** @param {readonly T[]} signals @param {"all" | T["type"]} filter @returns {readonly T[]} */
export function filterSignals(signals, filter) {
  return filter === "all" ? signals : signals.filter(({ type }) => type === filter);
}
