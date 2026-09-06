import { Suspense } from "react";
import { loadStageFloor } from "@/lib/studio/stage-floor-data";
import type { StageKind, StageScope } from "@/lib/studio/stage-floor-types";
import { StageFloor } from "./stage-floor";

type Props = Readonly<{ kind: StageKind; channelId?: string; productionId?: string; workflowId?: string; title?: string }>;

export function StageFloorSection({ kind, channelId, productionId, workflowId, title }: Props) {
  const scope: StageScope = { kind, channelId: channelId ?? null, productionId: productionId ?? null };
  return (
    <div className="mb-8 min-w-0" id="stage-floor">
      <Suspense fallback={<StageFloorLoading />}>
        <LoadedStageFloor scope={scope} workflowId={workflowId} title={title} />
      </Suspense>
    </div>
  );
}

async function LoadedStageFloor({ scope, workflowId, title }: { scope: StageScope; workflowId?: string; title?: string }) {
  const data = await loadStageFloor(scope);
  return <StageFloor scope={scope} data={data} initialWorkflowId={workflowId} title={title}
    staffingHref={scope.channelId ? `/app/channels/${scope.channelId}/staffing` : "/app/staffing"} />;
}

function StageFloorLoading() {
  return <section className="rounded-lg border border-border bg-surface p-6" aria-busy="true" aria-label="Stage Floor loading">
    <p className="font-mono text-sm text-text-muted" role="status">Opening Stage Floor…</p>
    <div className="mt-6 grid min-h-80 grid-cols-1 gap-4 md:grid-cols-[12rem_1fr]" aria-hidden="true">
      <div className="rounded border border-border bg-surface-2" />
      <div className="rounded border border-border bg-bg" />
    </div>
  </section>;
}
