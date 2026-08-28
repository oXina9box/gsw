import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const planPath = path.join(root, "planning", "onboarding-completion-plan.md");
const dispatchPath = path.join(root, ".unlazy", "onboarding-completion", "PLAN.md");
const gatesDir = path.join(root, ".unlazy", "onboarding-completion", "gates");
const plan = fs.readFileSync(planPath, "utf8");
const dispatch = fs.readFileSync(dispatchPath, "utf8");
const required = [
  "Identity questions and inputs",
  "Plan selection and BYOK path",
  "Secure provider connection",
  "First marketing lane",
  "Agent catalog and handoffs",
  "Illustration and asset pipeline",
  "Automated contract/security suite",
  "End-to-end integration and handoff",
  "Tagline conflict",
  "No studio name path",
  "Logo limits",
  "OAuth",
  "Six agent files",
];
const missing = required.filter((item) => !plan.includes(item));
if (missing.length) throw new Error(`missing plan requirements: ${missing.join(", ")}`);
const ids = [...dispatch.matchAll(/^\| (\d+\.\d+\.\d+\.\d+\.\d+\.\d+) \|/gm)].map((match) => match[1]);
if (ids.length !== 13 || new Set(ids).size !== ids.length) throw new Error(`expected 13 unique six-level leaves, found ${ids.length}`);
if (!dispatch.includes("Needs") || !dispatch.includes("Tier") || !dispatch.includes("Owns")) throw new Error("dispatch contract missing Owns/Needs/Tier");
if (process.argv.includes("--ledgers")) {
  const files = fs.readdirSync(gatesDir).filter((file) => file.startsWith("leaf-") && file.endsWith(".md"));
  const missingLedgers = ids.filter((id) => !files.includes(`leaf-${id}.md`));
  if (missingLedgers.length || files.length !== ids.length) throw new Error(`leaf ledger mismatch: missing ${missingLedgers.join(", ") || "none"}`);
  console.log("onboarding ledger verification passed");
} else {
  console.log("onboarding plan verification passed");
}
