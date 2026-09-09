import fs from "fs";

// 1. Check contact/actions.ts fails closed
const actionsTs = fs.readFileSync("web/app/(marketing)/contact/actions.ts", "utf8");
if (!actionsTs.includes("allowed = false;") || !actionsTs.includes("if (!allowed) {")) {
  console.error("FAIL: contact action still fails open on rate limit error");
  process.exit(1);
}

// 2. Check web/components/auth/auth-modal.tsx handles close and cancel events
const authModalTsx = fs.readFileSync("web/components/auth/auth-modal.tsx", "utf8");
if (!authModalTsx.includes("handleClose") || !authModalTsx.includes("addEventListener(\"cancel\"")) {
  console.error("FAIL: auth modal missing cancel / navigation sync");
  process.exit(1);
}

// 3. Check web/components/auth/auth-form.tsx settles busy state in finally block
const authFormTsx = fs.readFileSync("web/components/auth/auth-form.tsx", "utf8");
if (!authFormTsx.includes("finally {") || !authFormTsx.includes("setBusy(false)")) {
  console.error("FAIL: auth-form missing finally block for busy state recovery");
  process.exit(1);
}

// 4. Check web/components/shell/site-footer.tsx does not link to generic platform roots or stale repos
const footerTsx = fs.readFileSync("web/components/shell/site-footer.tsx", "utf8");
if (footerTsx.includes('href="https://facebook.com"') || footerTsx.includes('href="https://twitter.com"') || footerTsx.includes('href="https://instagram.com"')) {
  console.error("FAIL: generic social root links still present");
  process.exit(1);
}

console.log("WAVE2_VERIFIED: all wave 2 checks passed");
process.exit(0);
