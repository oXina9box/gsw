import fs from "node:fs";
import path from "node:path";
import xml2js from "node:util";

const root = process.cwd();

console.log("Starting onboarding completion automated verification...");

// 1. Check planning & design docs
const brandSpecPath = path.join(root, "planning", "brand-spec.md");
if (!fs.existsSync(brandSpecPath)) throw new Error("Missing planning/brand-spec.md");
const brandSpec = fs.readFileSync(brandSpecPath, "utf8");
if (!brandSpec.includes("variance: 5") || !brandSpec.includes("#ea0070")) {
  throw new Error("planning/brand-spec.md missing required dials or color tokens");
}

// 2. Check migration 0029
const migrationPath = path.join(root, "supabase", "migrations", "0029_onboarding_completion.sql");
if (!fs.existsSync(migrationPath)) throw new Error("Missing 0029_onboarding_completion.sql migration");
const migration = fs.readFileSync(migrationPath, "utf8");
const requiredMigrationTokens = [
  "commercial_choice",
  "provider_status",
  "missing_data_notes",
  "lane_handoffs",
  "marketing-director",
  "studio-brand-designer",
  "channel-discovery",
  "channel-branding",
  "channel-content-designer",
  "media-agent",
];
for (const token of requiredMigrationTokens) {
  if (!migration.includes(token)) throw new Error(`0029 migration missing token: ${token}`);
}

// 3. Check onboarding domain lib
const onboardingLibPath = path.join(root, "web", "lib", "studio", "onboarding.ts");
if (!fs.existsSync(onboardingLibPath)) throw new Error("Missing web/lib/studio/onboarding.ts");
const onboardingLib = fs.readFileSync(onboardingLibPath, "utf8");
const requiredLibExports = [
  "validateStudioIdentity",
  "validateCommercialChoice",
  "validateLogoUpload",
  "maskApiKey",
  "CONTENT_DIRECTION_OPTIONS",
  "COMMERCIAL_PLANS",
];
for (const exp of requiredLibExports) {
  if (!onboardingLib.includes(exp)) throw new Error(`web/lib/studio/onboarding.ts missing export: ${exp}`);
}

// 4. Check marketing domain lib
const marketingLibPath = path.join(root, "web", "lib", "studio", "marketing.ts");
if (!fs.existsSync(marketingLibPath)) throw new Error("Missing web/lib/studio/marketing.ts");
const marketingLib = fs.readFileSync(marketingLibPath, "utf8");
if (!marketingLib.includes("MARKETING_AGENT_ROLES") || !marketingLib.includes("evaluateMarketingChecklist")) {
  throw new Error("web/lib/studio/marketing.ts missing required contracts");
}

// 5. Check onboarding modal component
const modalPath = path.join(root, "web", "components", "onboarding", "onboarding-modal.tsx");
if (!fs.existsSync(modalPath)) throw new Error("Missing web/components/onboarding/onboarding-modal.tsx");
const modal = fs.readFileSync(modalPath, "utf8");
if (modal.includes('name="tagline"')) throw new Error("onboarding modal must not contain tagline field");
if (!modal.includes("brand_colors") || !modal.includes("studio_name_status") || !modal.includes("commercial")) {
  throw new Error("onboarding modal missing required field bindings");
}

// 6. Check pricing page
const pricingPath = path.join(root, "web", "app", "(marketing)", "pricing", "page.tsx");
if (!fs.existsSync(pricingPath)) throw new Error("Missing pricing/page.tsx");
const pricing = fs.readFileSync(pricingPath, "utf8");
if (!pricing.includes("cloud-1") || !pricing.includes("cloud-2") || !pricing.includes("byok")) {
  throw new Error("pricing/page.tsx missing required plan IDs");
}

// 7. Check SVG asset exists and is non-empty
const svgPath = path.join(root, "web", "public", "assets", "img", "onboarding-setup.svg");
if (!fs.existsSync(svgPath)) throw new Error("Missing web/public/assets/img/onboarding-setup.svg");
const svgContent = fs.readFileSync(svgPath, "utf8");
if (!svgContent.startsWith("<svg") || !svgContent.includes("</svg>")) {
  throw new Error("Invalid SVG asset markup");
}

console.log("onboarding completion verification passed");
