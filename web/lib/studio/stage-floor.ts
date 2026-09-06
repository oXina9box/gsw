import type { StageActionState, StageFloorData, StageKind, StageScope } from "./stage-floor-types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KINDS: readonly StageKind[] = ["marketing", "social", "production"];

export const EMPTY_STAGE_FLOOR: StageFloorData = {
  workflows: [],
  agents: [],
  lanes: [],
  rules: [],
  executions: [],
  steps: [],
  error: null,
};

export function emptyStageFloor(error: string | null): StageFloorData {
  return { ...EMPTY_STAGE_FLOOR, error };
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

function nullableUuid(value: unknown): value is string | null {
  return value === null || isUuid(value);
}

export function isStageScope(value: unknown): value is StageScope {
  if (!value || typeof value !== "object") return false;
  const scope = value as Record<string, unknown>;
  if (!KINDS.includes(scope.kind as StageKind) || !nullableUuid(scope.channelId) || !nullableUuid(scope.productionId)) return false;
  if (scope.kind !== "production" && scope.productionId !== null) return false;
  return !(scope.productionId !== null && scope.channelId === null);
}

export function stageScopeFromForm(formData: FormData): StageScope | null {
  const asNullableUuid = (name: string) => {
    const value = formData.get(name);
    return value === "" || value === null ? null : value;
  };
  const candidate = {
    kind: formData.get("kind"),
    channelId: asNullableUuid("channel_id"),
    productionId: asNullableUuid("production_id"),
  };
  return isStageScope(candidate) ? candidate : null;
}

export function floorDefinition(scope: StageScope): Record<string, unknown> {
  return { stage_floor: { kind: scope.kind, channelId: scope.channelId, productionId: scope.productionId } };
}

export function stageActionError(message: string): StageActionState {
  return { ok: false, message };
}

export function plainText(value: FormDataEntryValue | null, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

export type StageEndpoint = Readonly<{ kind: "agent" | "lane"; id: string }>;

export function stageEndpoint(value: FormDataEntryValue | null): StageEndpoint | null {
  if (typeof value !== "string") return null;
  const parts = value.split(":");
  const [kind, id] = parts;
  if (parts.length !== 2 || (kind !== "agent" && kind !== "lane") || !isUuid(id)) return null;
  return { kind, id };
}
