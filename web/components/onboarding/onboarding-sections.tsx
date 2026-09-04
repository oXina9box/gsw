import { saveOnboardingStep } from "@/app/(product)/actions";
import {
  CONTENT_DIRECTION_OPTIONS,
  type OnboardingStep,
} from "@/lib/studio/onboarding";

const CHANNEL_PRESETS = ["Content creation", "Advertising", "Film", "Documentary", "Other video format"] as const;
const CORE_DEPARTMENTS = ["Marketing", "Socials", "Development", "Production"] as const;
const OPTIONAL_TEAMS = ["R&D", "Advertising", "Merchandise", "Budgeting", "Scheduling", "Cross-channel"] as const;

export type OnboardingProfile = Readonly<{
  step?: string | null;
  studio_identity?: Record<string, unknown> | null;
  commercial_choice?: Record<string, unknown> | null;
  provider_status?: Record<string, unknown> | null;
  channel_setup?: Record<string, unknown> | null;
  department_setup?: Record<string, unknown> | null;
  lane_handoffs?: Record<string, unknown> | null;
}>;

type OnboardingSectionsProps = Readonly<{
  profile?: OnboardingProfile | null;
  activeSection?: string;
}>;

type SectionShellProps = Readonly<{
  id: OnboardingStep;
  number: string;
  title: string;
  description: string;
  complete: boolean;
  open: boolean;
  children: React.ReactNode;
}>;

function stringValue(record: Record<string, unknown>, ...keys: string[]) {
  const value = keys.map((key) => record[key]).find((candidate) => typeof candidate === "string");
  return typeof value === "string" ? value : "";
}

function booleanValue(record: Record<string, unknown>, ...keys: string[]) {
  return keys.map((key) => record[key]).find((candidate) => typeof candidate === "boolean") === true;
}

function stringArray(record: Record<string, unknown>, ...keys: string[]) {
  const value = keys.map((key) => record[key]).find(Array.isArray);
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  const encoded = stringValue(record, ...keys);
  return encoded ? encoded.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function SectionShell({ id, number, title, description, complete, open, children }: SectionShellProps) {
  return (
    <details
      id={id}
      open={open}
      className="group scroll-mt-24 overflow-hidden rounded-md border border-border bg-surface"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 bg-surface-2 px-4 py-4 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs font-semibold text-pink" aria-hidden="true">{number}</span>
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-base font-semibold text-text">{title}</strong>
          <span className="mt-1 block text-xs leading-5 text-text-muted">{description}</span>
        </span>
        <span className={`status-pill shrink-0 ${complete ? "is-complete" : "is-deferred"}`}>
          {complete ? "Saved" : "Open"}
        </span>
        <span className="text-text-muted transition-transform duration-150 group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <div className="border-t border-border p-4 sm:p-5">{children}</div>
    </details>
  );
}

function SaveButton({ children }: Readonly<{ children: React.ReactNode }>) {
  return <button className="button button-primary justify-self-start active:scale-[0.96]" type="submit">{children}</button>;
}

function SectionFields({ step }: Readonly<{ step: OnboardingStep }>) {
  return (
    <>
      <input type="hidden" name="step" value={step} />
      <input type="hidden" name="return_to" value={`/app/onboarding?section=${step}&saved=${step}`} />
    </>
  );
}

export function OnboardingSections({ profile, activeSection }: OnboardingSectionsProps) {
  const identity = profile?.studio_identity ?? {};
  const commercial = profile?.commercial_choice ?? {};
  const providers = profile?.provider_status ?? {};
  const channel = profile?.channel_setup ?? {};
  const departments = profile?.department_setup ?? {};
  const lane = profile?.lane_handoffs ?? {};

  const studioName = stringValue(identity, "studioName", "studio_name");
  const colors = stringArray(identity, "brandColors", "brand_colors");
  const direction = stringValue(identity, "contentDirection", "content_direction") || "Film";
  const savedPlan = stringValue(commercial, "plan");
  const plan = ["cloud-1", "cloud-2", "cloud-3", "byok"].includes(savedPlan) ? savedPlan : "cloud-1";
  const selectedDepartments = stringArray(departments, "departments");
  // Completed studios revisiting setup land on identity; the lane section only
  // auto-opens while that step is actually in progress.
  const step = profile?.step;
  const current = activeSection || (step && step !== "complete" ? step : "identity");

  return (
    <div className="grid gap-4">
      <SectionShell
        id="identity"
        number="01"
        title="Studio identity"
        description="Name the studio and set its basic creative signal. Everything can change later."
        complete={Boolean(profile?.studio_identity)}
        open={current === "identity"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="identity" />
          <div className="form-grid">
            <label>Studio name
              <input name="studio_name" required maxLength={80} defaultValue={studioName} placeholder="Obsidian Wave Pictures" />
            </label>
            <label>Tagline <span className="muted">Optional</span>
              <input name="tagline" maxLength={200} defaultValue={stringValue(identity, "tagline", "tagLine")} placeholder="Cinema at the speed of thought" />
            </label>
          </div>
          <div className="form-grid">
            <label>Primary format
              <select name="content_direction" defaultValue={direction}>
                {CONTENT_DIRECTION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <fieldset>
              <legend className="mb-2 font-mono text-xs uppercase text-text-muted">Brand colors</legend>
              <div className="flex flex-wrap gap-3">
                {[colors[0] || "#ea0070", colors[1] || "#7000ea", colors[2] || "#09090b"].map((color, index) => (
                  <label className="color-picker-item" key={`${color}-${index}`}>
                    <span className="sr-only">Brand color {index + 1}</span>
                    <input className="color-swatch-input" type="color" name="brand_colors" defaultValue={color} />
                    <span className="font-mono text-xs text-text-muted">{index === 0 ? "Primary" : index === 1 ? "Accent" : "Ink"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <label>Creative direction <span className="muted">Optional</span>
            <textarea name="content_description" rows={3} maxLength={1000} defaultValue={stringValue(identity, "contentDescription", "content_description")} placeholder="What should the studio be known for?" />
          </label>
          <SaveButton>Save identity</SaveButton>
        </form>
      </SectionShell>

      <SectionShell
        id="commercial"
        number="02"
        title="Usage preference"
        description="Choose how this studio expects to generate. Billing can still be changed later."
        complete={Boolean(profile?.commercial_choice)}
        open={current === "commercial"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="commercial" />
          <fieldset>
            <legend className="mb-3 font-mono text-xs uppercase text-text-muted">Generation setup</legend>
            <div className="commercial-cards-grid">
              {[
                ["cloud-1", "Content Pro", "One active channel with managed generation."],
                ["cloud-2", "Creator Pro", "A growing slate with up to three channels."],
                ["cloud-3", "Studio Pro", "A multi-channel studio with larger usage."],
                ["byok", "Bring your own keys", "Use provider credentials you control."],
              ].map(([value, label, description]) => (
                <label className="commercial-card has-[:checked]:border-pink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pink" key={value}>
                  <input type="radio" name="plan" value={value} defaultChecked={plan === value} />
                  <strong>{label}</strong>
                  <span className="card-desc">{description}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="checkbox-label">
            <input type="checkbox" name="byok_enabled" value="true" defaultChecked={booleanValue(commercial, "byokEnabled", "byok_enabled") || plan === "byok"} />
            <span>Allow my provider keys alongside managed usage</span>
          </label>
          <SaveButton>Save usage preference</SaveButton>
        </form>
      </SectionShell>

      <SectionShell
        id="providers"
        number="03"
        title="AI providers"
        description="Optional. Add keys now, or connect providers later from Integrations."
        complete={Boolean(profile?.provider_status)}
        open={current === "providers"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="providers" />
          <div className="provider-cards-stack">
            <label className="provider-box">OpenAI API key
              <input name="openai_key" type="password" minLength={8} autoComplete="new-password" placeholder={booleanValue(providers, "openai_connected") ? "Connected — enter only to replace" : "sk-…"} />
              <span className="field-hint">Encrypted server-side. Existing keys never return to this page.</span>
            </label>
            <label className="provider-box">Anthropic API key
              <input name="anthropic_key" type="password" minLength={8} autoComplete="new-password" placeholder={booleanValue(providers, "anthropic_connected") ? "Connected — enter only to replace" : "sk-ant-…"} />
              <span className="field-hint">Leave blank to keep current provider state.</span>
            </label>
          </div>
          <SaveButton>Save provider setup</SaveButton>
        </form>
      </SectionShell>

      <SectionShell
        id="channel"
        number="04"
        title="First channel"
        description="Optional starter outlet. Skip it if you only want to explore the studio."
        complete={Boolean(profile?.channel_setup)}
        open={current === "channel"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="channel" />
          <div className="form-grid">
            <label>Channel name
              <input name="channel_name" maxLength={60} defaultValue={stringValue(channel, "channel_name")} placeholder="Neon Horizon" />
            </label>
            <label>Target audience <span className="muted">Optional</span>
              <input name="audience" maxLength={120} defaultValue={stringValue(channel, "audience")} placeholder="Who is this channel for?" />
            </label>
          </div>
          <div className="form-grid">
            <label>Format
              <select name="preset" defaultValue={stringValue(channel, "preset") || "Film"}>
                {CHANNEL_PRESETS.map((preset) => <option key={preset}>{preset}</option>)}
              </select>
            </label>
            <label>Release shape
              <select name="season" defaultValue={stringValue(channel, "season") || "Single film"}>
                <option>Single film</option>
                <option>10-episode season</option>
                <option>Open-ended stream</option>
              </select>
            </label>
          </div>
          <input type="hidden" name="episode" value="Pilot / Episode 01" />
          <SaveButton>Save channel setup</SaveButton>
        </form>
      </SectionShell>

      <SectionShell
        id="hiring"
        number="05"
        title="Departments"
        description="Choose teams to highlight first. The full production floor remains available."
        complete={Boolean(profile?.department_setup)}
        open={current === "hiring"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="hiring" />
          <fieldset className="hiring-fieldset">
            <legend>Core teams</legend>
            <div className="checkbox-grid">
              {CORE_DEPARTMENTS.map((department) => (
                <label className="checkbox-label" key={department}>
                  <input type="checkbox" name="departments" value={department} defaultChecked={!selectedDepartments.length || selectedDepartments.includes(department)} />
                  <span>{department}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="hiring-fieldset">
            <legend>Optional teams</legend>
            <div className="checkbox-grid">
              {OPTIONAL_TEAMS.map((team) => (
                <label className="checkbox-label" key={team}>
                  <input type="checkbox" name="optional_teams" value={team} />
                  <span>{team}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <SaveButton>Save department setup</SaveButton>
        </form>
      </SectionShell>

      <SectionShell
        id="lane"
        number="06"
        title="Starter workflow"
        description="Install a useful baseline workflow. Review each handoff before saving."
        complete={Boolean(profile?.lane_handoffs)}
        open={current === "lane" || current === "complete"}
      >
        <form action={saveOnboardingStep} className="stack-form">
          <SectionFields step="lane" />
          <div className="lane-approval-checklist">
            {[
              ["studio_brand_approved", "Studio identity brief", "Makes identity available to downstream creative work."],
              ["channel_discovery_approved", "Channel discovery brief", "Carries format and audience into channel planning."],
              ["media_plan_approved", "Media planning handoff", "Adds a starting release-planning handoff."],
            ].map(([name, label, description]) => (
              <label className="checkbox-label approval-item" key={name}>
                <input type="checkbox" name={name} value="true" defaultChecked={booleanValue(lane, name)} />
                <span>
                  <strong className="block">{label}</strong>
                  <span className="field-hint block">{description}</span>
                </span>
              </label>
            ))}
          </div>
          <SaveButton>Save starter workflow</SaveButton>
        </form>
      </SectionShell>
    </div>
  );
}
