"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { saveOnboardingStep } from "@/app/(product)/actions";
import {
  COMMERCIAL_PLANS,
  type CommercialPlan,
  CONTENT_DIRECTION_OPTIONS,
  type ContentDirectionOption,
  LOGO_ALLOWED_MIME_TYPES,
  maskApiKey,
  ONBOARDING_STEP_META,
  type OnboardingStep,
  validateLogoUpload,
} from "@/lib/studio/onboarding";

const CHANNEL_PRESETS = ["Content creation", "Advertising", "Film", "Documentary", "Other video format"] as const;
const CORE_DEPARTMENTS = ["Marketing", "Socials", "Development", "Production"] as const;
const OPTIONAL_TEAMS = ["R&D", "Advertising", "Merchandise", "Budgeting", "Scheduling", "Cross-channel"] as const;

const ERROR_MESSAGES: Record<string, string> = {
  order: "Steps run in order. Pick up where the last step saved.",
  step: "Unknown setup step. Start again from the current step.",
  identity: "The studio needs a name before it can open.",
  commercial: "Please select a valid plan or BYOK choice.",
  providers: "Provider credentials could not be saved. Check the key and try again.",
  channel: "The first channel needs a name before it can be filed.",
  hiring: "Departments could not be saved. Check the list and try again.",
  lane: "First lane approvals must be confirmed before launching.",
  save: "Setup could not be saved. Try again.",
};

type OnboardingModalProps = Readonly<{
  initialStep?: OnboardingStep | null;
  initialProfile?: {
    mode?: string | null;
    step?: string | null;
    studio_identity?: Record<string, unknown> | null;
    commercial_choice?: Record<string, unknown> | null;
    provider_status?: Record<string, unknown> | null;
    channel_setup?: Record<string, unknown> | null;
    department_setup?: Record<string, unknown> | null;
    lane_handoffs?: Record<string, unknown> | null;
    missing_data_notes?: string[] | null;
  } | null;
  defaultOpen?: boolean;
}>;

export function OnboardingModal({ initialStep = "identity", initialProfile, defaultOpen = false }: OnboardingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  const requestedStep = searchParams.get("step") as OnboardingStep | null;
  const currentStep: OnboardingStep =
    requestedStep && ONBOARDING_STEP_META.some((e) => e.step === requestedStep)
      ? requestedStep
      : initialStep || "identity";

  const [step, setStep] = useState<OnboardingStep>(currentStep);

  // Step 1: Identity State
  const initialIdentity = (initialProfile?.studio_identity ?? {}) as Record<string, unknown>;
  const [deferName, setDeferName] = useState(initialIdentity.studio_name_status === "deferred");
  const [studioName, setStudioName] = useState(typeof initialIdentity.studio_name === "string" ? initialIdentity.studio_name : "");
  const [tagline, setTagline] = useState(typeof initialIdentity.tagline === "string" ? initialIdentity.tagline : "");
  const [logoPreview, setLogoPreview] = useState<string | null>(typeof initialIdentity.logo_url === "string" ? initialIdentity.logo_url : null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const initialColors = Array.isArray(initialIdentity.brand_colors) && initialIdentity.brand_colors.length > 0
    ? (initialIdentity.brand_colors as string[])
    : ["#ea0070"];
  const [brandColors, setBrandColors] = useState<string[]>(initialColors);

  const [deferContent, setDeferContent] = useState(initialIdentity.content_direction_status === "deferred");
  const [contentDirection, setContentDirection] = useState<ContentDirectionOption>(
    typeof initialIdentity.content_direction === "string" && (CONTENT_DIRECTION_OPTIONS as readonly string[]).includes(initialIdentity.content_direction)
      ? (initialIdentity.content_direction as ContentDirectionOption)
      : "Film"
  );
  const [contentDescription, setContentDescription] = useState(
    typeof initialIdentity.content_description === "string" ? initialIdentity.content_description : ""
  );

  // Step 2: Commercial Choice State
  const initialCommercial = (initialProfile?.commercial_choice ?? {}) as Record<string, unknown>;
  const [selectedPlan, setSelectedPlan] = useState<CommercialPlan>(
    typeof initialCommercial.plan === "string" && (COMMERCIAL_PLANS as readonly string[]).includes(initialCommercial.plan)
      ? (initialCommercial.plan as CommercialPlan)
      : (searchParams.get("plan") as CommercialPlan) || "cloud-1"
  );
  const [byokEnabled, setByokEnabled] = useState<boolean>(
    typeof initialCommercial.byok_enabled === "boolean" ? initialCommercial.byok_enabled : selectedPlan === "byok"
  );

  // Step 3: Provider Connection State
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const initialProviders = (initialProfile?.provider_status ?? {}) as Record<string, unknown>;
  const openaiConnected = Boolean(initialProviders.openai_connected);
  const anthropicConnected = Boolean(initialProviders.anthropic_connected);

  // Step 4: Channel State
  const initialChannel = (initialProfile?.channel_setup ?? {}) as Record<string, unknown>;
  const [channelName, setChannelName] = useState(typeof initialChannel.channel_name === "string" ? initialChannel.channel_name : "");
  const [audience, setAudience] = useState(typeof initialChannel.audience === "string" ? initialChannel.audience : "");
  const [season, setSeason] = useState(typeof initialChannel.season === "string" ? initialChannel.season : "Single film");
  const [channelPreset, setChannelPreset] = useState(typeof initialChannel.preset === "string" ? initialChannel.preset : "Film");

  // Step 5: Hiring State
  const [selectedDepts, setSelectedDepts] = useState<string[]>([...CORE_DEPARTMENTS]);

  // Step 6: First Lane State
  const [brandApproved, setBrandApproved] = useState(true);
  const [channelApproved, setChannelApproved] = useState(true);
  const [mediaApproved, setMediaApproved] = useState(true);

  useEffect(() => {
    if (defaultOpen || searchParams.has("onboarding") || searchParams.has("step")) {
      dialogRef.current?.showModal();
    }
  }, [defaultOpen, searchParams]);
  useEffect(() => {
    const handleOpen = () => {
      dialogRef.current?.showModal();
    };
    window.addEventListener("open-onboarding-modal", handleOpen);
    return () => window.removeEventListener("open-onboarding-modal", handleOpen);
  }, []);

  const close = () => {
    dialogRef.current?.close();
  };

  const stepMeta = ONBOARDING_STEP_META.find((entry) => entry.step === step) ?? ONBOARDING_STEP_META[0];
  const stepIndex = ONBOARDING_STEP_META.findIndex((entry) => entry.step === step);
  const errorParam = searchParams.get("error");

  const handleColorChange = (index: number, value: string) => {
    const next = [...brandColors];
    next[index] = value;
    setBrandColors(next);
  };

  const addColor = () => {
    if (brandColors.length < 3) {
      setBrandColors([...brandColors, brandColors.length === 1 ? "#7000ea" : "#09090b"]);
    }
  };

  const removeColor = (index: number) => {
    if (brandColors.length > 1) {
      setBrandColors(brandColors.filter((_, i) => i !== index));
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateLogoUpload({ type: file.type, size: file.size });
    if (!check.valid) {
      setLogoError(check.error || "Invalid logo file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <dialog
      ref={dialogRef}
      className="command-dialog onboarding-modal-dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      onClose={close}
    >
      <div className="dialog-topline">
        <span id="onboarding-modal-title">Studio Setup · {stepMeta.title}</span>
        {step === "complete" ? (
          <button className="dialog-close" type="button" onClick={close} aria-label="Close setup">×</button>
        ) : null}
      </div>

      <div className="onboarding-modal-body">
        <nav className="onboarding-rail" aria-label="Setup progress">
          {ONBOARDING_STEP_META.map((entry, index) => (
            <span
              key={entry.step}
              className={`onboarding-rail-step ${entry.step === step ? "is-current" : ""} ${index < stepIndex ? "is-done" : ""}`}
              aria-current={entry.step === step ? "step" : undefined}
            >
              {String(index + 1).padStart(2, "0")} {entry.label}
            </span>
          ))}
        </nav>

        <p className="lede">{stepMeta.summary}</p>
        {errorParam ? <p className="form-error" role="alert">{ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.save}</p> : null}

        {/* STEP 1: IDENTITY */}
        {step === "identity" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="identity" />

            <div className="form-field-group">
              <div className="field-header-row">
                <label htmlFor={`${formId}-studio-name`}>Studio name</label>
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="studio_name_status"
                    value="deferred"
                    checked={deferName}
                    onChange={(e) => setDeferName(e.target.checked)}
                  />
                  <span>Decide later</span>
                </label>
              </div>
              {!deferName ? (
                <input
                  id={`${formId}-studio-name`}
                  type="text"
                  name="studio_name"
                  required={!deferName}
                  maxLength={80}
                  placeholder="e.g. Obsidian Wave Pictures"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                />
              ) : (
                <p className="field-hint">Studio will temporarily be named &ldquo;Untitled Studio&rdquo; until customized.</p>
              )}
            </div>

            {/* Studio Tag Line */}
            <div className="form-field-group">
              <label htmlFor={`${formId}-tagline`}>Studio Tag Line</label>
              <input
                id={`${formId}-tagline`}
                type="text"
                name="tagline"
                maxLength={200}
                placeholder="e.g. Cinema at the speed of thought"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            {/* Logo Upload */}
            <div className="form-field-group">
              <label>Studio mark / logo</label>
              <div className="logo-upload-box">
                {logoPreview ? (
                  <div className="logo-preview-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreview} alt="Studio logo preview" className="logo-preview-img" />
                    <button
                      type="button"
                      className="button button-outline button-small"
                      onClick={() => {
                        setLogoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="logo-upload-prompt">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id={`${formId}-logo-upload`}
                      accept={LOGO_ALLOWED_MIME_TYPES.join(",")}
                      onChange={handleLogoSelect}
                      className="file-input-hidden"
                    />
                    <label htmlFor={`${formId}-logo-upload`} className="button button-outline button-small">
                      Upload SVG / PNG (max 5 MB)
                    </label>
                    <span className="field-hint">Or continue with default geometric gem mark.</span>
                  </div>
                )}
                {logoError ? <p className="form-error" role="alert">{logoError}</p> : null}
              </div>
            </div>

            {/* Brand Colors (1-3) */}
            <div className="form-field-group">
              <div className="field-header-row">
                <label>Brand colors (1–3)</label>
                {brandColors.length < 3 && (
                  <button type="button" className="button-text-action" onClick={addColor}>
                    + Add accent color
                  </button>
                )}
              </div>
              <div className="color-pickers-row">
                {brandColors.map((color, index) => (
                  <div key={index} className="color-picker-item">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      aria-label={`Color role ${index + 1}`}
                      className="color-swatch-input"
                    />
                    <input
                      type="text"
                      name="brand_colors"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                      maxLength={7}
                      className="color-hex-input"
                      aria-label={`Hex color ${index + 1}`}
                    />
                    {brandColors.length > 1 && (
                      <button
                        type="button"
                        className="color-remove-btn"
                        onClick={() => removeColor(index)}
                        aria-label={`Remove color ${index + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Direction */}
            <div className="form-field-group">
              <div className="field-header-row">
                <label htmlFor={`${formId}-content-direction`}>Primary content format</label>
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    name="content_direction_status"
                    value="deferred"
                    checked={deferContent}
                    onChange={(e) => setDeferContent(e.target.checked)}
                  />
                  <span>Decide later</span>
                </label>
              </div>
              {!deferContent && (
                <select
                  id={`${formId}-content-direction`}
                  name="content_direction"
                  value={contentDirection}
                  onChange={(e) => setContentDirection(e.target.value as ContentDirectionOption)}
                >
                  {CONTENT_DIRECTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Free-form Description */}
            <div className="form-field-group">
              <label htmlFor={`${formId}-content-desc`}>Creative direction / studio vision (optional)</label>
              <textarea
                id={`${formId}-content-desc`}
                name="content_description"
                rows={2}
                maxLength={1000}
                placeholder="e.g. Gritty cyberpunk neo-noir, speculative future documentaries, cinematic worldbuilding"
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
              />
            </div>

            <button className="button button-primary" type="submit">Save studio &amp; continue →</button>
          </form>
        )}

        {/* STEP 2: COMMERCIAL CHOICE */}
        {step === "commercial" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="commercial" />

            <div className="commercial-cards-grid">
              <label className={`commercial-card ${selectedPlan === "cloud-1" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="plan"
                  value="cloud-1"
                  checked={selectedPlan === "cloud-1"}
                  onChange={() => setSelectedPlan("cloud-1")}
                />
                <div className="card-header">
                  <strong>Content Pro</strong>
                  <span className="tier-badge">1 Channel</span>
                </div>
                <p className="card-desc">Starter cloud generation workspace with 1 channel and DNA continuity.</p>
              </label>

              <label className={`commercial-card ${selectedPlan === "cloud-2" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="plan"
                  value="cloud-2"
                  checked={selectedPlan === "cloud-2"}
                  onChange={() => setSelectedPlan("cloud-2")}
                />
                <div className="card-header">
                  <strong>Creator Pro</strong>
                  <span className="tier-badge">3 Channels</span>
                </div>
                <p className="card-desc">Connected slate workspace with 3 channels and shared asset library.</p>
              </label>

              <label className={`commercial-card ${selectedPlan === "cloud-3" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="plan"
                  value="cloud-3"
                  checked={selectedPlan === "cloud-3"}
                  onChange={() => setSelectedPlan("cloud-3")}
                />
                <div className="card-header">
                  <strong>Studio Pro</strong>
                  <span className="tier-badge">5 Channels</span>
                </div>
                <p className="card-desc">Full operating system for active studios with 5 channels and protected catalog.</p>
              </label>

              <label className={`commercial-card ${selectedPlan === "byok" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="plan"
                  value="byok"
                  checked={selectedPlan === "byok"}
                  onChange={() => {
                    setSelectedPlan("byok");
                    setByokEnabled(true);
                  }}
                />
                <div className="card-header">
                  <strong>BYOK Only</strong>
                  <span className="tier-badge">Bring Keys</span>
                </div>
                <p className="card-desc">Run directly with your own OpenAI / Anthropic keys without cloud credits.</p>
              </label>
            </div>

            {selectedPlan !== "byok" && (
              <label className="checkbox-label" style={{ marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  name="byok_enabled"
                  value="true"
                  checked={byokEnabled}
                  onChange={(e) => setByokEnabled(e.target.checked)}
                />
                <span>Also enable BYOK (use your own keys alongside Cloud credits)</span>
              </label>
            )}

            <div className="form-actions-split">
              <button className="button button-outline" type="button" onClick={() => setStep("identity")}>← Back</button>
              <button className="button button-primary" type="submit">Confirm plan &amp; continue →</button>
            </div>
          </form>
        )}

        {/* STEP 3: PROVIDERS */}
        {step === "providers" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="providers" />

            <div className="provider-cards-stack">
              <div className="provider-box">
                <div className="provider-header">
                  <strong>OpenAI</strong>
                  {openaiConnected ? <span className="status-tag status-connected">Connected (AES-256)</span> : <span className="status-tag">Unconfigured</span>}
                </div>
                <label>API Key
                  <input
                    type="password"
                    name="openai_key"
                    placeholder={openaiConnected ? maskApiKey("sk-proj-configured") : "sk-..."}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                </label>
                <span className="field-hint">Used for text generation, story editing, and script writing. Key is encrypted with AES-256-GCM.</span>
              </div>

              <div className="provider-box">
                <div className="provider-header">
                  <strong>Anthropic</strong>
                  {anthropicConnected ? <span className="status-tag status-connected">Connected (AES-256)</span> : <span className="status-tag">Unconfigured</span>}
                </div>
                <label>API Key
                  <input
                    type="password"
                    name="anthropic_key"
                    placeholder={anthropicConnected ? maskApiKey("sk-ant-configured") : "sk-ant-..."}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                  />
                </label>
                <span className="field-hint">Used for screenplay drafting and research synthesis. Key is encrypted with AES-256-GCM.</span>
              </div>
            </div>

            <div className="form-actions-split">
              <button className="button button-outline" type="button" onClick={() => setStep("commercial")}>← Back</button>
              <button className="button button-primary" type="submit">Save providers &amp; continue →</button>
            </div>
          </form>
        )}

        {/* STEP 4: CHANNEL */}
        {step === "channel" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="channel" />
            <label>First channel name
              <input
                type="text"
                name="channel_name"
                required
                maxLength={60}
                placeholder="e.g. Neon Horizon"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </label>
            <label>Target audience
              <input
                type="text"
                name="audience"
                maxLength={120}
                placeholder="e.g. Hard sci-fi enthusiasts, visual effects craft community"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </label>
            <div className="form-grid">
              <label>Preset
                <select name="preset" value={channelPreset} onChange={(e) => setChannelPreset(e.target.value)}>
                  {CHANNEL_PRESETS.map((preset) => <option key={preset} value={preset}>{preset}</option>)}
                </select>
              </label>
              <label>Season scope &amp; episode format
                <select name="season" value={season} onChange={(e) => setSeason(e.target.value)}>
                  <option value="Single film">Single feature film (1 production)</option>
                  <option value="10-episode season">10-episode anthology season</option>
                  <option value="Open-ended stream">Continuous serial productions</option>
                </select>
              </label>
            </div>
            <input type="hidden" name="episode" value="Pilot / Episode 01" />
            <div className="form-actions-split">
              <button className="button button-outline" type="button" onClick={() => setStep("providers")}>← Back</button>
              <button className="button button-primary" type="submit">Save channel &amp; continue →</button>
            </div>
          </form>
        )}

        {/* STEP 5: HIRING */}
        {step === "hiring" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="hiring" />
            <p className="muted">The studio floor is fixed: all 13 production departments are established. Select the teams active on day one:</p>
            <fieldset className="hiring-fieldset">
              <legend>Core departments</legend>
              <div className="checkbox-grid">
                {CORE_DEPARTMENTS.map((dept) => (
                  <label key={dept} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="departments"
                      value={dept}
                      checked={selectedDepts.includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDepts([...selectedDepts, dept]);
                        else setSelectedDepts(selectedDepts.filter((d) => d !== dept));
                      }}
                    />
                    <span>{dept}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="hiring-fieldset">
              <legend>Optional expansion teams</legend>
              <div className="checkbox-grid">
                {OPTIONAL_TEAMS.map((team) => (
                  <label key={team} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="optional_teams"
                      value={team}
                    />
                    <span>{team}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-actions-split">
              <button className="button button-outline" type="button" onClick={() => setStep("channel")}>← Back</button>
              <button className="button button-primary" type="submit">Complete department setup →</button>
            </div>
          </form>
        )}

        {/* STEP 6: FIRST LANE WORKBENCH */}
        {step === "lane" && (
          <form action={saveOnboardingStep} className="stack-form">
            <input type="hidden" name="step" value="lane" />
            <p className="muted">Review and approve initial briefs for your first Marketing lane:</p>

            <div className="lane-approval-checklist">
              <label className="checkbox-label approval-item">
                <input
                  type="checkbox"
                  name="studio_brand_approved"
                  value="true"
                  checked={brandApproved}
                  onChange={(e) => setBrandApproved(e.target.checked)}
                />
                <div>
                  <strong>Studio Brand Brief</strong>
                  <span className="field-hint">Identity: {studioName || "Untitled Studio"} · Colors: {brandColors.join(", ")}</span>
                </div>
              </label>

              <label className="checkbox-label approval-item">
                <input
                  type="checkbox"
                  name="channel_discovery_approved"
                  value="true"
                  checked={channelApproved}
                  onChange={(e) => setChannelApproved(e.target.checked)}
                />
                <div>
                  <strong>First Channel Brief</strong>
                  <span className="field-hint">Outlet: {channelName || "First Channel"} · Format: {contentDirection}</span>
                </div>
              </label>

              <label className="checkbox-label approval-item">
                <input
                  type="checkbox"
                  name="media_plan_approved"
                  value="true"
                  checked={mediaApproved}
                  onChange={(e) => setMediaApproved(e.target.checked)}
                />
                <div>
                  <strong>Initial Media Schedule</strong>
                  <span className="field-hint">Initial pilot release pipeline and social staging plan</span>
                </div>
              </label>
            </div>

            <div className="form-actions-split">
              <button className="button button-outline" type="button" onClick={() => setStep("hiring")}>← Back</button>
              <button className="button button-primary" type="submit" disabled={!brandApproved || !channelApproved || !mediaApproved}>
                Approve handoffs &amp; finalize →
              </button>
            </div>
          </form>
        )}

        {/* STEP 7: COMPLETE */}
        {step === "complete" && (
          <div className="panel onboarding-complete-panel">
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <Image
                src="/assets/img/onboarding-setup.svg"
                alt="Studio setup complete"
                width={320}
                height={240}
                priority
                style={{ margin: "0 auto", maxWidth: "100%", height: "auto" }}
              />
            </div>
            <p>Studio ready. The default lane workflow is installed and the floor is open.</p>
            <form action={saveOnboardingStep}>
              <input type="hidden" name="step" value="complete" />
              <button
                className="button button-primary"
                type="submit"
                onClick={close}
              >
                Open Front Office ↗
              </button>
            </form>
          </div>
        )}
      </div>
    </dialog>
  );
}

export function openOnboardingModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-onboarding-modal"));
  }
}
