export function filterSignals<T extends { type: "native" | "conversation" }>(signals: readonly T[], filter: "all" | T["type"]): readonly T[];
