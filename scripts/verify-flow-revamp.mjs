import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const target = process.argv[2];

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function checkSpecs() {
  const specPath = path.resolve("planning/site-workflow-spec.md");
  const flowSpecPath = path.resolve("planning/flow-revamp-spec.md");
  assert(existsSync(specPath), "planning/site-workflow-spec.md must exist");
  assert(existsSync(flowSpecPath), "planning/flow-revamp-spec.md must exist");

  const flowSpec = readFileSync(flowSpecPath, "utf8");
  assert(flowSpec.includes("Content Pro"), "flow spec must specify Content Pro");
  assert(flowSpec.includes("Creator Pro"), "flow spec must specify Creator Pro");
  assert(flowSpec.includes("Hollywood Pro"), "flow spec must specify Hollywood Pro");
  assert(flowSpec.includes("Content BYOK"), "flow spec must specify Content BYOK");
  assert(flowSpec.includes("Creator BYOK"), "flow spec must specify Creator BYOK");
  assert(flowSpec.includes("Self Host Creator Community"), "flow spec must specify Self Host Creator Community");
  assert(flowSpec.includes("Full Name"), "flow spec must specify Full Name in Account Details");
  assert(flowSpec.includes("Confirm Email"), "flow spec must specify Confirm Email");
  assert(flowSpec.includes("Tag Line"), "flow spec must specify Studio Tag Line");
  assert(flowSpec.includes("Marketing") && flowSpec.includes("Socials") && flowSpec.includes("Development") && flowSpec.includes("Production"), "flow spec must specify 4 core departments");
  assert(flowSpec.includes("AT NO POINT DO WE TIP THE IP AGENT DETAILS"), "flow spec must enforce IP protection");

  console.log("flow revamp specs verification passed");
}

function checkDocs() {
  const docsContentPath = path.resolve("web/lib/docs/content.ts");
  assert(existsSync(docsContentPath), "web/lib/docs/content.ts must exist");
  const content = readFileSync(docsContentPath, "utf8");

  assert(content.includes("self-host") || content.includes("deployment"), "docs must cover self-hosting");
  assert(content.includes("agent-system"), "docs must cover agent system");
  assert(content.includes("byok-security"), "docs must cover byok security");
  assert(content.includes("role") && content.includes("soul") && content.includes("jobdescription"), "docs must explain the 6-file agent structure");
  assert(content.includes("IP") || content.includes("protected") || content.includes("Protected"), "docs must explain protected agent IP boundaries");

  console.log("docs and discovery verification passed");
}

function checkPricing() {
  const pricingPath = path.resolve("web/app/(marketing)/pricing/page.tsx");
  const pricingLibPath = path.resolve("web/lib/studio/pricing.ts");
  assert(existsSync(pricingPath), "web/app/(marketing)/pricing/page.tsx must exist");
  assert(existsSync(pricingLibPath), "web/lib/studio/pricing.ts must exist");

  const pricingCode = readFileSync(pricingPath, "utf8");
  const pricingLib = readFileSync(pricingLibPath, "utf8");

  assert(pricingLib.includes("Content Pro") && (pricingCode.includes("Content Pro") || pricingCode.includes("PRO_PLANS")), "pricing must include Content Pro");
  assert(pricingLib.includes("Creator Pro") && (pricingCode.includes("Creator Pro") || pricingCode.includes("PRO_PLANS")), "pricing must include Creator Pro");
  assert(pricingLib.includes("Hollywood Pro") && (pricingCode.includes("Hollywood Pro") || pricingCode.includes("PRO_PLANS")), "pricing must include Hollywood Pro");
  assert(pricingLib.includes("Content BYOK") && (pricingCode.includes("Content BYOK") || pricingCode.includes("BYOK_PLANS")), "pricing must include Content BYOK");
  assert(pricingLib.includes("Creator BYOK") && (pricingCode.includes("Creator BYOK") || pricingCode.includes("BYOK_PLANS")), "pricing must include Creator BYOK");
  assert(pricingCode.includes("Payroll") || pricingCode.includes("payroll"), "pricing must include Payroll budget section");

  console.log("pricing tiers verification passed");
}

function checkAuth() {
  const authFormPath = path.resolve("web/components/auth/auth-form.tsx");
  const authModalPath = path.resolve("web/components/auth/auth-modal.tsx");
  assert(existsSync(authFormPath), "web/components/auth/auth-form.tsx must exist");
  assert(existsSync(authModalPath), "web/components/auth/auth-modal.tsx must exist");

  const formCode = readFileSync(authFormPath, "utf8");
  assert(formCode.includes("fullName") || formCode.includes("Full Name") || formCode.includes("name"), "auth form must support Full Name input");
  assert(formCode.includes("email") || formCode.includes("Email"), "auth form must support Email input");
  assert(formCode.includes("password") || formCode.includes("Password"), "auth form must support Password input");
  assert(formCode.includes("Confirm your email") || formCode.includes("Check your email") || formCode.includes("confirm"), "auth form must have email confirmation guidance");

  console.log("auth signup flow verification passed");
}

function checkOnboarding() {
  const modalPath = path.resolve("web/components/onboarding/onboarding-modal.tsx");
  const onboardingLibPath = path.resolve("web/lib/studio/onboarding.ts");
  assert(existsSync(modalPath), "web/components/onboarding/onboarding-modal.tsx must exist");
  assert(existsSync(onboardingLibPath), "web/lib/studio/onboarding.ts must exist");

  const modalCode = readFileSync(modalPath, "utf8");
  const libCode = readFileSync(onboardingLibPath, "utf8");

  assert(modalCode.includes("studioName") || modalCode.includes("Studio Name") || modalCode.includes("studio_name"), "onboarding must collect studio name");
  assert(modalCode.includes("logo") || modalCode.includes("Logo"), "onboarding must collect studio logo");
  assert(modalCode.includes("tagline") || modalCode.includes("Tagline") || modalCode.includes("tagLine") || modalCode.includes("tag_line"), "onboarding must collect tagline");
  assert(modalCode.includes("brandColors") || modalCode.includes("brand_colors") || modalCode.includes("Colors") || modalCode.includes("palette"), "onboarding must collect brand colors");
  assert(libCode.includes("tagline") || libCode.includes("tagLine") || libCode.includes("tag_line"), "onboarding lib must handle tagline schema");

  console.log("studio essentials verification passed");
}

function checkDepartments() {
  const builderPath = path.resolve("web/app/(product)/app/builder/page.tsx");
  const deptLibPath = path.resolve("web/lib/studio/departments.ts");
  assert(existsSync(builderPath), "web/app/(product)/app/builder/page.tsx must exist");
  assert(existsSync(deptLibPath), "web/lib/studio/departments.ts must exist");

  const deptLib = readFileSync(deptLibPath, "utf8");
  assert(deptLib.includes("Marketing"), "departments must include Marketing");
  assert(deptLib.includes("Socials"), "departments must include Socials");
  assert(deptLib.includes("Development"), "departments must include Development");
  assert(deptLib.includes("Production"), "departments must include Production");
  assert(deptLib.includes("preconfigured") || deptLib.includes("PRECONFIGURED_LANES"), "departments lib must support preconfigured lanes for Pro");

  console.log("departmental setup verification passed");
}

function checkAgents() {
  const agentEditorPath = path.resolve("web/components/product/agent-editor.tsx");
  const agentProtectionLibPath = path.resolve("web/lib/studio/agent-protection.ts");
  assert(existsSync(agentEditorPath), "web/components/product/agent-editor.tsx must exist");
  assert(existsSync(agentProtectionLibPath), "web/lib/studio/agent-protection.ts must exist");

  const editorCode = readFileSync(agentEditorPath, "utf8");
  const protectionLib = readFileSync(agentProtectionLibPath, "utf8");

  // 6 files
  assert(editorCode.includes("role"), "agent editor must support role file");
  assert(editorCode.includes("soul"), "agent editor must support soul file");
  assert(editorCode.includes("jobdescription"), "agent editor must support jobdescription file");
  assert(editorCode.includes("skills"), "agent editor must support skills file");
  assert(editorCode.includes("memory"), "agent editor must support memory file");
  assert(editorCode.includes("user_content"), "agent editor must support user_content file");

  // Zero IP tipping / protected configuration enforcement
  assert(protectionLib.includes("protected") || protectionLib.includes("mask") || protectionLib.includes("sanitize"), "agent protection lib must enforce protection");
  assert(editorCode.includes("protected") || editorCode.includes("isProtected") || editorCode.includes("protected_config"), "agent editor must enforce read-only/hidden state for protected agents");

  console.log("agent 6-file and ip protection verification passed");
}

function checkDesign() {
  const globalsCssPath = path.resolve("web/app/globals.css");
  assert(existsSync(globalsCssPath), "web/app/globals.css must exist");
  const css = readFileSync(globalsCssPath, "utf8");

  assert(css.includes("Hallmark") || css.includes("Tastemaker") || css.includes("var(--color-"), "CSS must contain design system tokens or stamp");
  assert(css.includes("--color-primary") || css.includes("--color-accent"), "CSS must define accent/primary color tokens");
  assert(css.includes("max-width") || css.includes("@media"), "CSS must include responsive styles");

  console.log("design and anti-slop verification passed");
}

function checkTestSuite() {
  console.log("Running typecheck...");
  execSync("npm run typecheck", { cwd: path.resolve("web"), stdio: "inherit" });
  console.log("Running lint...");
  execSync("npm run lint", { cwd: path.resolve("web"), stdio: "inherit" });
  console.log("Running unit tests...");
  execSync("npm test", { cwd: path.resolve("web"), stdio: "inherit" });

  console.log("test suite verification passed");
}

switch (target) {
  case "specs": checkSpecs(); break;
  case "docs": checkDocs(); break;
  case "pricing": checkPricing(); break;
  case "auth": checkAuth(); break;
  case "onboarding": checkOnboarding(); break;
  case "departments": checkDepartments(); break;
  case "agents": checkAgents(); break;
  case "design": checkDesign(); break;
  case "testsuite": checkTestSuite(); break;
  default:
    console.error(`Unknown target: ${target}`);
    process.exit(1);
}
