import fs from "fs";

// Read content.ts and docs/page.tsx
const contentTs = fs.readFileSync("web/lib/docs/content.ts", "utf8");
const pageTsx = fs.readFileSync("web/app/(marketing)/docs/page.tsx", "utf8");

// Check that page does not contain Latin placeholder spotlight copy
if (pageTsx.includes("Lorem Ipsum Quickstart") || pageTsx.includes("Consectetur GenPlay")) {
  console.error("FAIL: Latin placeholder spotlight copy still present in docs/page.tsx");
  process.exit(1);
}

// Check that page derives cards from docArticles
if (!pageTsx.includes("docArticles.map") || !pageTsx.includes("/docs/${article.slug}")) {
  console.error("FAIL: Cards not derived from docArticles");
  process.exit(1);
}

// Check that content.ts defines all core guides (studio-pipeline, dna-continuity, genplay-contracts, agent-system, byok-security, self-host-community)
const expectedSlugs = [
  "studio-pipeline",
  "dna-continuity",
  "genplay-contracts",
  "agent-system",
  "byok-security",
  "self-host-community"
];

for (const slug of expectedSlugs) {
  if (!contentTs.includes(`slug: "${slug}"`)) {
    console.error(`FAIL: Missing expected guide slug ${slug}`);
    process.exit(1);
  }
}

console.log("DOCS_INDEX_VERIFIED: all articles indexed correctly");
process.exit(0);
