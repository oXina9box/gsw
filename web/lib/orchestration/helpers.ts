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
