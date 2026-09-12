"use client";

import type { ReactNode } from "react";
import { useChannelView } from "@/components/product/use-channel-view";

type ChannelProductionClientProps = Readonly<{
  stageFloorSlot: ReactNode;
  slatesSlot: ReactNode;
}>;

export function ChannelProductionClient({
  stageFloorSlot,
  slatesSlot,
}: ChannelProductionClientProps) {
  const { activeView } = useChannelView("production");

  return (
    <div className="space-y-4">

      {activeView === "stage-floor" && (
        <>
          {stageFloorSlot}
          {slatesSlot}
        </>
      )}
    </div>
  );
}
