type Condition = { field: string; op?: string; value?: unknown };

function getPath(source: Record<string, unknown>, path: string): unknown {
  let current: unknown = source;
  for (const part of path.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function mapPayload(context: Record<string, unknown>, mapping: unknown): Record<string, unknown> {
  if (mapping === null || typeof mapping !== "object" || Array.isArray(mapping)) return {};
  const result: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(mapping as Record<string, unknown>)) {
    if (typeof path !== "string") continue;
    const value = getPath(context, path);
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export function evaluateConditions(context: Record<string, unknown>, conditions: unknown): boolean {
  if (!Array.isArray(conditions)) return true;
  return conditions.every((entry) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) return false;
    const condition = entry as Condition;
    if (typeof condition.field !== "string" || condition.field.length === 0) return false;
    const actual = getPath(context, condition.field);
    switch (condition.op) {
      case "neq":
        return actual !== condition.value;
      case "exists":
        return actual !== undefined && actual !== null;
      case "eq":
      case undefined:
        return actual === condition.value;
      default:
        return false;
    }
  });
}

const CONDITION_OPS: Record<string, true> = { eq: true, neq: true, exists: true };

export function validateConditions(conditions: unknown): readonly string[] {
  if (conditions === null || conditions === undefined) return [];
  if (!Array.isArray(conditions)) return ["Conditions must be a JSON array."];
  const errors: string[] = [];
  conditions.forEach((entry, index) => {
    const label = `Condition ${index + 1}`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) { errors.push(`${label} must be an object.`); return; }
    const condition = entry as Condition;
    if (typeof condition.field !== "string" || condition.field.length === 0) errors.push(`${label} needs a field.`);
    if (condition.op !== undefined && !CONDITION_OPS[condition.op]) errors.push(`${label} operator must be one of: eq, neq, exists.`);
  });
  return errors;
}

export type ChainDocument = Readonly<{ id: string; content: unknown }>;

export function normalizeDocumentSet(value: unknown): ChainDocument[] {
  if (!Array.isArray(value)) return [];
  const documents: ChainDocument[] = [];
  const seen: Record<string, true> = {};
  for (const entry of value) {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) continue;
    const document = entry as { id?: unknown; content?: unknown };
    if (typeof document.id !== "string" || document.id.length === 0 || document.content === undefined || seen[document.id]) continue;
    seen[document.id] = true;
    documents.push({ id: document.id, content: document.content });
  }
  return documents;
}

export function mergeDocumentSet(previous: unknown, additions: unknown): ChainDocument[] {
  const merged = normalizeDocumentSet(previous);
  for (const document of normalizeDocumentSet(additions)) {
    const index = merged.findIndex((item) => item.id === document.id);
    if (index < 0) merged.push(document);
    else merged[index] = document;
  }
  return merged;
}

export type CollaborationMode = "forward" | "round_table";

export function validatePassOrder(mode: CollaborationMode, passOrder: unknown, passCycles: unknown): readonly string[] {
  if (mode === "forward") return [];
  if (!Array.isArray(passOrder) || passOrder.length < 1 || passOrder.length > 50 || passOrder.some((id) => !Number.isInteger(id) || id < 0)) return ["Round-table pass order must contain 1 to 50 non-negative agent positions."];
  if (!Number.isInteger(passCycles) || Number(passCycles) < 1 || Number(passCycles) > 20) return ["Round-table cycles must be an integer from 1 to 20."];
  return [];
}

export function nextRoundTablePass(input: Readonly<{ passOrder: readonly number[]; cycle: number; pass: number }>) {
  if (input.passOrder.length === 0 || input.cycle < 0 || input.pass < 0) return null;
  const nextPass = input.pass + 1;
  if (nextPass < input.passOrder.length) return { agentPosition: input.passOrder[nextPass], cycle: input.cycle, pass: nextPass };
  return { agentPosition: input.passOrder[0], cycle: input.cycle + 1, pass: 0 };
}
