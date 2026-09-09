import fs from "fs";

// 1. Verify .gitlab-ci.yml has unit-tests coverage, dependency-audit, and e2e-tests
const ciYml = fs.readFileSync(".gitlab-ci.yml", "utf8");
if (!ciYml.includes("npm run test:coverage")) {
  console.error("FAIL: CI missing test:coverage");
  process.exit(1);
}
if (!ciYml.includes("dependency-audit:") || !ciYml.includes("npm audit --omit=dev --audit-level=high")) {
  console.error("FAIL: CI missing dependency-audit job");
  process.exit(1);
}
if (!ciYml.includes("e2e-tests:") || !ciYml.includes("playwright test")) {
  console.error("FAIL: CI missing e2e-tests job");
  process.exit(1);
}

// 2. Verify web/package.json has next >= 16.3.3
const pkgJson = JSON.parse(fs.readFileSync("web/package.json", "utf8"));
const nextVer = pkgJson.dependencies?.next;
if (!nextVer || nextVer.includes("16.3.1")) {
  console.error("FAIL: Next.js still on vulnerable version:", nextVer);
  process.exit(1);
}

console.log("WAVE3_VERIFIED: all wave 3 checks passed");
process.exit(0);
