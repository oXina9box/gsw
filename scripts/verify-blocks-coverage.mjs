#!/usr/bin/env node
/* Block coverage oracle: every rendered page must import a vendored block
   from components/blocks. Redirect stubs and LegalDocument pages exempt.
   Usage: node scripts/verify-blocks-coverage.mjs (run from repo root or web/) */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry === "page.tsx") pages.push(p);
  }
})(join(web, "app"));

const failures = [];
for (const page of pages) {
  const src = readFileSync(page, "utf8");
  const rel = relative(root, page);
  if (/redirect\(/.test(src) || /LegalDocument/.test(src)) continue;
  if (!/@\/components\/blocks\//.test(src)) failures.push(rel);
}

if (failures.length) {
  console.error("BLOCK COVERAGE FAIL");
  for (const f of failures) console.error("  no block import: " + f);
  process.exit(1);
}
console.log("BLOCK COVERAGE PASS");
