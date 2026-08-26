import { readFile } from "node:fs/promises";

const files = ["web/app/(marketing)/docs/page.tsx", "web/app/(marketing)/pricing/page.tsx"];
const forbidden = [/TODO/i, /coming soon/i, /lorem ipsum/i, /PLACEHOLDER/i];
const failures = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${file}: ${pattern}`);
}
if (failures.length) { console.error("PUBLIC_COPY_CHECK_FAILED"); failures.forEach(console.error); process.exit(1); }
console.log("PUBLIC_COPY_CHECK_PASSED");
