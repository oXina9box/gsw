"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChannelSubnav } from "@/components/product/channel-subnav";

const PRODUCTION_NAV_GROUPS = [
  {
    items: [{ id: "stage-floor", label: "Production Stage Floor" }],
  },
] as const;

type ChannelProductionClientProps = Readonly<{
  stageFloorSlot: ReactNode;
  slatesSlot: ReactNode;
}>;

export function ChannelProductionClient({
  stageFloorSlot,
  slatesSlot,
}: ChannelProductionClientProps) {
  const [activeView, setActiveView] = useState("stage-floor");

  return (
    <div className="space-y-6">
      <ChannelSubnav
        activeTab="production"
        activeView={activeView}
        groups={PRODUCTION_NAV_GROUPS}
        onViewChange={(id) => setActiveView(id)}
      />

      {activeView === "stage-floor" && (
        <>
          {stageFloorSlot}
          {slatesSlot}
        </>
      )}
    </div>
  );
}
