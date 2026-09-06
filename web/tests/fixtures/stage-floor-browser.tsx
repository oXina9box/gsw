import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { StageFloor } from "../../components/product/stage-floor";
import type { StageFloorData, StageKind } from "../../lib/studio/stage-floor-types";
import "../../app/globals.css";

function Fixture() {
  const [data, setData] = useState<StageFloorData | null>(null);
  useEffect(() => {
    const refresh = () => { void fetch("/fixture-data").then((response) => response.json()).then(setData); };
    refresh();
    window.addEventListener("fixture-refresh", refresh);
    return () => window.removeEventListener("fixture-refresh", refresh);
  }, []);
  const params = new URLSearchParams(window.location.search);
  const kind = (params.get("kind") ?? "marketing") as StageKind;
  if (!data) return <p>Loading test fixture</p>;
  return <main style={{ padding: "24px", maxWidth: "1800px", margin: "auto" }}>
    <p style={{ marginBottom: "16px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>GEM STUDIO / TEST WORKSPACE</p>
    <StageFloor scope={{ kind, channelId: null, productionId: null }} data={data} initialWorkflowId={params.get("workflow") ?? undefined} staffingHref="/app/staffing" />
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
