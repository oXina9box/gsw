export const ONBOARDING_STEPS = ["identity", "channel", "hiring", "complete"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export function nextOnboardingStep(current: OnboardingStep | null, requested: OnboardingStep) {
  if (!current) return requested === "identity" ? requested : null;
  const index = ONBOARDING_STEPS.indexOf(current);
  return ONBOARDING_STEPS[index + 1] === requested || requested === current ? requested : null;
}
