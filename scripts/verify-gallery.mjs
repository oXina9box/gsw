import { readFile } from "node:fs/promises";

const source = await readFile("web/app/(marketing)/gallery/page.tsx", "utf8");
const failures = [];

// Public gallery must never carry tenant identifiers or fixture/placeholder records.
for (const pattern of [/workspace[_-]?id/i, /workspaceId/, /fixture/i, /placeholder/i, /TODO/i]) {
  if (pattern.test(source)) failures.push(`forbidden gallery token: ${pattern}`);
}

for (const required of ["approved", "publication_state", '"published"', "credits", "rights_status"]) {
  if (!source.includes(required)) failures.push(`missing public curation check: ${required}`);
}

const curatedIds = [...source.matchAll(/id:\s*["']([^"']+)["']/g)].map((match) => match[1]);
if (curatedIds.length === 0) failures.push("no curated gallery records found");
if (new Set(curatedIds).size !== curatedIds.length) failures.push("duplicate curated gallery id");

if (failures.length > 0) {
  console.error("GALLERY_CHECK_FAILED");
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log("GALLERY_CHECK_PASSED");
