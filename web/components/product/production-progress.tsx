import { DEPARTMENTS } from "@/lib/studio/domain";

export function ProductionProgress({ currentStep, runMode, departments = DEPARTMENTS }: { currentStep: number; runMode: string; departments?: readonly string[] }) {
  return <div className="production-progress"><div className="flow">{departments.map((name, index) => <div key={name}><span className={`dot ${index < currentStep ? "lime" : index === currentStep ? "cyan" : ""}`}></span><strong>{String(index + 1).padStart(2, "0")}</strong><small>{name}</small></div>)}</div><small>{runMode === "manual" ? "Choose the exact current-stage artifact below to approve and advance." : runMode === "semi_auto" ? "Approve the bound handoff below to advance." : "Auto runs one bound stage job at a time within policy."}</small></div>;
}
