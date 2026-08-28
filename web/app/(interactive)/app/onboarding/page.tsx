import Link from "next/link";
import { saveOnboardingStep } from "@/app/(product)/actions";
import { OnboardingAssistant } from "@/components/product/onboarding-assistant";
import { OnboardingIntro } from "@/components/onboarding/onboarding-intro";
import { ONBOARDING_STEP_META, type OnboardingStep } from "@/lib/studio/onboarding";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Studio setup" };

const CONTENT_TYPES = ["Film", "Episodic series", "Documentary", "Advertising", "Content creation", "Other video format"] as const;
const CHANNEL_PRESETS = ["Content creation", "Advertising", "Film", "Documentary", "Other video format"] as const;
const CORE_DEPARTMENTS = ["Marketing", "Creative", "Production", "Social"] as const;
const OPTIONAL_TEAMS = ["R&D", "Advertising", "Merchandise", "Budgeting", "Scheduling", "Cross-channel"] as const;

const ERROR_MESSAGES: Record<string, string> = {
  order: "Steps run in order. Pick up where the last step saved.",
  step: "Unknown setup step. Start again from the current step.",
  identity: "The studio needs a name before it can open.",
  channel: "The first channel needs a name before it can be filed.",
  hiring: "Departments could not be saved. Check the list and try again.",
  save: "Setup could not be saved. Try again.",
};

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string; error?: string }> }) {
  const { supabase } = await getWorkspaceContext();
  const [{ data }, { data: connections }] = await Promise.all([
    supabase.from("onboarding_profiles").select("mode, step, studio_identity, channel_setup, department_setup").maybeSingle(),
    supabase.from("provider_connections").select("id, label, provider").eq("status", "active").contains("capabilities", ["text"]).order("label"),
  ]);
  const params = await searchParams;
  const requested = params.step;
  const step = requested === "identity" || requested === "channel" || requested === "hiring" || requested === "complete"
    ? requested
    : (data?.step as OnboardingStep | null) ?? "identity";
  const meta = ONBOARDING_STEP_META.find((entry) => entry.step === step) ?? ONBOARDING_STEP_META[0];
  const stepIndex = ONBOARDING_STEP_META.findIndex((entry) => entry.step === step);
  const mode = data?.mode === "fast" ? "fast" : "guided";
  const identity = (data?.studio_identity ?? {}) as Record<string, unknown>;
  const channel = (data?.channel_setup ?? {}) as Record<string, unknown>;
  const departments = (data?.department_setup ?? {}) as Record<string, unknown>;
  const guidance = step === "identity"
    ? "A lane is a working team of agents. Guided mode explains each handoff while you brand the studio; fast mode records choices with fewer prompts. The assistant teaches how lanes operate as you configure them."
    : step === "channel"
      ? "A channel owns recurring audience context. A forward-facing lane will carry its work from brief to release. Season scope can be a film, a finite season, or an open-ended stream."
      : step === "hiring"
        ? "Core departments cover Marketing, Creative, Production, and Social. Social lives under Marketing organizationally but bills at the top level. Add optional teams only when a real workload needs them."
        : "The default lane workflow is installed. Productions now move through lanes you can bolster or trim from the builder.";

  return <section className="product-page onboarding-page shell" data-archetype="B1-A">
    <nav className="onboarding-rail" aria-label="Setup progress">
      {ONBOARDING_STEP_META.map((entry, index) => <span key={entry.step} className={`onboarding-rail-step ${entry.step === step ? "is-current" : ""} ${index < stepIndex ? "is-done" : ""}`} aria-current={entry.step === step ? "step" : undefined}>{String(index + 1).padStart(2, "0")} {entry.label}</span>)}
    </nav>
    <h1>{meta.title}</h1>
    <p className="lede">{meta.summary}</p>
    <OnboardingIntro step={step} />
    <aside className="panel"><strong>Lane guide</strong><p className="muted">{guidance}</p></aside>
    {mode !== "fast" && step !== "complete" ? <OnboardingAssistant connections={connections ?? []} /> : null}
    {params.error ? <p className="form-error" role="alert">{ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.save}</p> : null}

    {step === "complete" ? <div className="panel onboarding-complete"><p>Studio ready. The default lane workflow is installed and the floor is open.</p><Link className="button button-primary" href="/app">Open Front Office ↗</Link></div> : <form action={saveOnboardingStep} className="stack-form">
      <input type="hidden" name="step" value={step} />
      <label>Assistant mode
        <select name="mode" defaultValue={mode}>
          <option value="guided">Guided — assistant suggests at each handoff</option>
          <option value="fast">Fast — assistant confirms, files, and passes off</option>
        </select>
      </label>

      {step === "identity" ? <>
        <label>Studio name<input name="studio_name" required maxLength={120} defaultValue={stringField(identity.studio_name)} placeholder="Northlight Pictures" /></label>
        <label>Tagline<input name="tagline" maxLength={160} defaultValue={stringField(identity.tagline)} placeholder="Films for the next signal." /></label>
        <label>Brand color<input type="color" name="brand_color" defaultValue={stringField(identity.brand_color) || "#ff2e88"} /></label>
        <label>Initial content type
          <select name="content_type" defaultValue={stringField(identity.content_type) || "Film"}>
            {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </> : null}

      {step === "channel" ? <>
        <label>Channel name<input name="channel_name" required maxLength={120} defaultValue={stringField(channel.channel_name)} placeholder="Midnight Signal" /></label>
        <label>Channel preset
          <select name="preset" defaultValue={stringField(channel.preset) || "Film"}>
            {CHANNEL_PRESETS.map((preset) => <option key={preset} value={preset}>{preset}</option>)}
          </select>
        </label>
        <label>Target audience<input name="audience" maxLength={240} defaultValue={stringField(channel.audience)} placeholder="Late-night sci-fi viewers, 25–45" /></label>
        <label>Format<input name="format" maxLength={160} defaultValue={stringField(channel.format)} placeholder="4K episodic series" /></label>
        <label>Season scope<input name="season_scope" maxLength={160} defaultValue={stringField(channel.season_scope)} placeholder="Film, finite season, or open-ended stream" /></label>
        <label>Episode plan<input name="episode_plan" maxLength={160} defaultValue={stringField(channel.episode_plan)} placeholder="8 episodes × 12 minutes" /></label>
      </> : null}

      {step === "hiring" ? <>
        <label>Departments (comma-separated)
          <input name="departments" maxLength={400} defaultValue={stringField(departments.departments) || CORE_DEPARTMENTS.join(", ")} />
        </label>
        <p className="muted">Core: {CORE_DEPARTMENTS.join(", ")}. Optional teams: {OPTIONAL_TEAMS.join(", ")}.</p>
      </> : null}

      <button className="button button-primary" type="submit">Save and continue</button>
    </form>}
  </section>;
}
