import { advanceProduction } from "@/app/(product)/actions";

const departments = ["Research", "Marketing", "Creative", "Story", "Storyboard", "Script", "Screenplay", "AI Conversion", "Video Production", "Launch", "Social Posting", "Social Management", "Reporting"];

export function ProductionProgress({ productionId, currentStep, stepCount }: { productionId: string; currentStep: number; stepCount: number }) {
  return <div className="production-progress"><div className="flow">{departments.map((name, index) => <div key={name}><span className={`dot ${index < currentStep ? "lime" : index === currentStep ? "cyan" : ""}`}></span><strong>{String(index + 1).padStart(2, "0")}</strong><small>{name}</small></div>)}</div><form action={advanceProduction}><input type="hidden" name="production_id" value={productionId} /><button className="button button-primary" type="submit" disabled={currentStep >= stepCount}>{currentStep >= stepCount ? "Complete" : `Advance to ${departments[currentStep] ?? "complete"} →`}</button></form></div>;
}
