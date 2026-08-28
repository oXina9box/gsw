export const ONBOARDING_STEPS = ["identity", "commercial", "providers", "channel", "hiring", "lane", "complete"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const CONTENT_DIRECTION_OPTIONS = [
  "Film",
  "Episodic series",
  "Documentary",
  "Advertising",
  "Short-form / Social",
  "Experimental",
  "Decide later",
] as const;
export type ContentDirectionOption = (typeof CONTENT_DIRECTION_OPTIONS)[number];

export const COMMERCIAL_PLANS = ["cloud-1", "cloud-2", "cloud-3", "byok"] as const;
export type CommercialPlan = (typeof COMMERCIAL_PLANS)[number];

export const LOGO_ALLOWED_MIME_TYPES = ["image/svg+xml", "image/png", "image/webp"] as const;
export const LOGO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const LOGO_MAX_DIMENSION = 4096;

export interface StudioIdentityInput {
  studioNameStatus: "provided" | "deferred";
  studioName?: string;
  logoAssetId?: string;
  logoUrl?: string;
  brandColors: string[];
  contentDirectionStatus: "provided" | "deferred";
  contentDirection?: ContentDirectionOption;
  contentDescription?: string;
}

export interface CommercialChoiceInput {
  plan: CommercialPlan;
  byokEnabled: boolean;
}

export interface ProviderConnectionInput {
  provider: "openai" | "anthropic";
  apiKey?: string;
  maskedKey?: string;
  status: "unconfigured" | "connected" | "error";
  error?: string;
}

export interface LaneHandoffInput {
  studioBrandApproved: boolean;
  channelDiscoveryApproved: boolean;
  channelBrandingApproved: boolean;
  mediaPlanApproved: boolean;
}

export function nextOnboardingStep(current: OnboardingStep | null, requested: OnboardingStep): OnboardingStep | null {
  if (!current) return requested === "identity" ? requested : null;
  const currentIndex = ONBOARDING_STEPS.indexOf(current);
  const requestedIndex = ONBOARDING_STEPS.indexOf(requested);
  if (requestedIndex < 0) return null;
  // One step forward, or revisit any step at or before the current one; no skipping ahead.
  return requestedIndex === currentIndex + 1 || requestedIndex <= currentIndex ? requested : null;
}

/** Onboarding is mandatory: any step other than "complete" keeps the studio in setup. */
export function shouldRedirectToOnboarding(step: unknown): boolean {
  return step !== "complete";
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function validateStudioIdentity(input: unknown): { valid: boolean; errors: string[]; data?: StudioIdentityInput } {
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Identity input must be an object"] };
  }
  const obj = input as Record<string, unknown>;
  const errors: string[] = [];

  const studioNameStatus = obj.studioNameStatus === "deferred" ? "deferred" : "provided";
  let studioName: string | undefined;

  if (studioNameStatus === "provided") {
    if (typeof obj.studioName !== "string" || !obj.studioName.trim()) {
      errors.push("Studio name is required when provided");
    } else {
      studioName = obj.studioName.trim();
      if (studioName.length > 80) {
        errors.push("Studio name must be 80 characters or fewer");
      }
    }
  } else {
    studioName = typeof obj.studioName === "string" && obj.studioName.trim() ? obj.studioName.trim() : "Untitled Studio";
  }

  const brandColors: string[] = [];
  if (Array.isArray(obj.brandColors) && obj.brandColors.length > 0) {
    for (const color of obj.brandColors) {
      if (typeof color === "string" && HEX_COLOR_REGEX.test(color.trim())) {
        brandColors.push(color.trim().toLowerCase());
      }
    }
  }
  if (brandColors.length === 0) {
    brandColors.push("#ea0070"); // default brand accent
  }
  if (brandColors.length > 3) {
    brandColors.length = 3;
  }

  const contentDirectionStatus = obj.contentDirectionStatus === "deferred" ? "deferred" : "provided";
  let contentDirection: ContentDirectionOption | undefined;

  if (contentDirectionStatus === "provided") {
    if (typeof obj.contentDirection === "string" && (CONTENT_DIRECTION_OPTIONS as readonly string[]).includes(obj.contentDirection)) {
      contentDirection = obj.contentDirection as ContentDirectionOption;
    } else {
      contentDirection = "Film";
    }
  } else {
    contentDirection = "Decide later";
  }

  const contentDescription = typeof obj.contentDescription === "string" ? obj.contentDescription.trim().slice(0, 1000) : undefined;
  const logoAssetId = typeof obj.logoAssetId === "string" && obj.logoAssetId.trim() ? obj.logoAssetId.trim() : undefined;
  const logoUrl = typeof obj.logoUrl === "string" && obj.logoUrl.trim() ? obj.logoUrl.trim() : undefined;

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      studioNameStatus,
      studioName,
      logoAssetId,
      logoUrl,
      brandColors,
      contentDirectionStatus,
      contentDirection,
      contentDescription,
    },
  };
}

export function validateCommercialChoice(input: unknown): { valid: boolean; errors: string[]; data?: CommercialChoiceInput } {
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Commercial choice must be an object"] };
  }
  const obj = input as Record<string, unknown>;
  const errors: string[] = [];

  let plan: CommercialPlan = "cloud-1";
  if (typeof obj.plan === "string" && (COMMERCIAL_PLANS as readonly string[]).includes(obj.plan)) {
    plan = obj.plan as CommercialPlan;
  } else {
    errors.push("Invalid commercial plan selected");
  }

  const byokEnabled = typeof obj.byokEnabled === "boolean" ? obj.byokEnabled : plan === "byok";

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: { plan, byokEnabled },
  };
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  const start = trimmed.slice(0, 7); // e.g. "sk-proj" or "sk-ant-"
  const end = trimmed.slice(-4);
  return `${start}...${end}`;
}

export function validateLogoUpload(fileMeta: {
  type: string;
  size: number;
  width?: number;
  height?: number;
}): { valid: boolean; error?: string } {
  if (!(LOGO_ALLOWED_MIME_TYPES as readonly string[]).includes(fileMeta.type)) {
    return { valid: false, error: "Unsupported image format. Allowed: SVG, PNG, WebP" };
  }
  if (fileMeta.size > LOGO_MAX_BYTES) {
    return { valid: false, error: "File exceeds max upload size of 5 MB" };
  }
  if (fileMeta.width && fileMeta.width > LOGO_MAX_DIMENSION) {
    return { valid: false, error: "Image width exceeds max dimension of 4096px" };
  }
  if (fileMeta.height && fileMeta.height > LOGO_MAX_DIMENSION) {
    return { valid: false, error: "Image height exceeds max dimension of 4096px" };
  }
  return { valid: true };
}

export const ONBOARDING_STEP_META: ReadonlyArray<Readonly<{ step: OnboardingStep; label: string; title: string; summary: string }>> = [
  { step: "identity", label: "Studio identity", title: "Name your studio", summary: "Brand the studio: name, logo, colors, and content direction." },
  { step: "commercial", label: "Plan & Billing", title: "Choose access tier", summary: "Select managed Cloud credits, bring your own API keys (BYOK), or both." },
  { step: "providers", label: "AI Providers", title: "Connect AI engines", summary: "Connect OpenAI or Anthropic safely with encrypted keys and masked credentials." },
  { step: "channel", label: "First channel", title: "Set up first channel", summary: "Open the first outlet: preset, audience, season scope, and episode plan." },
  { step: "hiring", label: "Hiring fair", title: "Configure departments", summary: "Staff core departments and configure the studio roster." },
  { step: "lane", label: "First lane", title: "Marketing workbench", summary: "Review and approve Studio Brand, Channel Brief, and Media plan handoffs." },
  { step: "complete", label: "Studio launch", title: "Setup complete", summary: "The initial studio records and workflow are installed. Launch into your studio." },
];
