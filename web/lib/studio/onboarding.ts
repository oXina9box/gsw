export const ONBOARDING_STEPS = ["identity", "channel", "hiring", "complete"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export function nextOnboardingStep(current: OnboardingStep | null, requested: OnboardingStep) {
  if (!current) return requested === "identity" ? requested : null;
  const currentIndex = ONBOARDING_STEPS.indexOf(current);
  const requestedIndex = ONBOARDING_STEPS.indexOf(requested);
  // One step forward, or revisit any step at or before the current one; no skipping ahead.
  return requestedIndex === currentIndex + 1 || requestedIndex <= currentIndex ? requested : null;
}

/** Onboarding is mandatory: any step other than "complete" keeps the studio in setup. */
export function shouldRedirectToOnboarding(step: unknown) {
  return step !== "complete";
}
export const ONBOARDING_STEP_META: ReadonlyArray<Readonly<{ step: OnboardingStep; label: string; title: string; summary: string }>> = [
  { step: "identity", label: "Studio identity", title: "Name your studio", summary: "Brand the studio: name, tagline, color, first content type. Choose guided or fast assistance." },
  { step: "channel", label: "First channel", title: "Set up first channel", summary: "Open the first outlet: preset, audience, season scope, episode plan, and process depth." },
  { step: "hiring", label: "Hiring fair", title: "Configure departments", summary: "Staff the core departments and add optional teams only when a real workload needs them." },
  { step: "complete", label: "Studio launch", title: "Setup complete", summary: "The default lane workflow is installed. Open the Front Office and start a production." },
];
