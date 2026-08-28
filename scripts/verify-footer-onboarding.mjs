#!/usr/bin/env node
// Gate oracle for the footer/logo/onboarding task. Usage: node scripts/verify-footer-onboarding.mjs <gate>
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");
const gate = process.argv[2];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function assertAll(haystack, needles, label) {
  for (const needle of needles) {
    if (!haystack.includes(needle)) fail(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function decodePng(buffer, file) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(signature)) fail(`${file}: not a PNG`);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = -1;
  const idat = [];
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (colorType !== 6) fail(`${file}: color type ${colorType}, expected RGBA (6) — no alpha channel`);
  const raw = inflateSync(Buffer.concat(idat));
  const channels = 4;
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let previous = Buffer.alloc(stride);
  let cursor = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;
    const line = Buffer.from(raw.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? line[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3) value = (value + ((left + up) >> 1)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value = (value + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
      } else if (filter !== 0) {
        fail(`${file}: unknown PNG filter ${filter}`);
      }
      line[x] = value;
    }
    line.copy(pixels, y * stride);
    previous = line;
  }
  let transparent = 0;
  let whiteOpaque = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 128) transparent += 1;
    else if (pixels[i] > 240 && pixels[i + 1] > 240 && pixels[i + 2] > 240) whiteOpaque += 1;
  }
  const total = width * height;
  return { file, width, height, transparentShare: transparent / total, whiteShare: whiteOpaque / total, bytes: buffer.length };
}

function npm(script) {
  const result = spawnSync("npm", ["run", script], { cwd: join(root, "web"), encoding: "utf8", stdio: "pipe" });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`npm run ${script} exited ${result.status}`);
  }
}

if (gate === "logos") {
  for (const file of ["web/public/assets/img/gem-mark.png", "web/public/assets/img/logo.png"]) {
    const info = decodePng(readFileSync(join(root, file)), file);
    if (info.transparentShare < 0.05) fail(`${file}: only ${(info.transparentShare * 100).toFixed(1)}% transparent pixels — background not cut`);
    if (info.whiteShare > 0.02) fail(`${file}: ${(info.whiteShare * 100).toFixed(1)}% opaque white pixels — would render as white box`);
    if (info.bytes > 300_000) fail(`${file}: ${info.bytes} bytes exceeds 300KB web budget`);
    if (info.width > 1024) fail(`${file}: width ${info.width} exceeds 1024px`);
  }
  console.log("logos verification passed");
} else if (gate === "slots") {
  assertAll(read("web/components/shell/site-header-client.tsx"), ["GemLogo"], "site header");
  assertAll(read("web/components/shell/site-footer.tsx"), ["GemMark"], "site footer");
  assertAll(read("web/components/product/studio-nav.tsx"), ["GemMark"], "studio nav");
  assertAll(read("web/app/layout.tsx"), ["gem-mark.png"], "root layout favicon");
  assertAll(read("web/components/shell/gem-brand-icon.tsx"), ["/assets/img/logo.png", "/assets/img/gem-mark.png"], "logo components");
  console.log("logo slots verification passed");
} else if (gate === "footer") {
  const footer = read("web/components/shell/site-footer.tsx");
  const required = [
    'href="/"', 'href="/studio"', 'href="/system"', 'href="/social-workshop"',
    'href="/portfolio"', 'href="/gallery"', 'href="/docs"', 'href="/pricing"',
    'href="/core-values"', 'href="/contact"', 'href="/terms"', 'href="/privacy"',
    'protectedHref("/app")', 'protectedHref("/app/studio")', 'href="/account"',
    'href="/signup"', 'href="/login"', "SignOutButton",
  ];
  assertAll(footer, required, "footer links");
  console.log("footer verification passed");
} else if (gate === "signup") {
  const form = read("web/components/auth/auth-form.tsx");
  if (!/mode === "signup"[\s\S]*?\/app\/onboarding/.test(form) && !/\/app\/onboarding[\s\S]*?mode === "signup"/.test(form)) {
    fail("auth form: signup success path does not route to /app/onboarding");
  }
  if (!form.includes('"/app/onboarding"')) fail("auth form: missing literal /app/onboarding redirect");
  console.log("signup redirect verification passed");
} else if (gate === "gate") {
  const lib = read("web/lib/studio/onboarding.ts");
  assertAll(lib, ["export function shouldRedirectToOnboarding"], "onboarding lib");
  const layout = read("web/app/(product)/layout.tsx");
  assertAll(layout, ["shouldRedirectToOnboarding", 'redirect("/app/onboarding")', "onboarding_profiles"], "product layout gate");
  const onboardingPage = read("web/app/(interactive)/app/onboarding/page.tsx");
  if (onboardingPage.includes("shouldRedirectToOnboarding")) fail("onboarding page gates itself — redirect loop");
  console.log("onboarding gate verification passed");
} else if (gate === "group") {
  if (!existsSync(join(root, "web/app/(interactive)/app/onboarding/page.tsx"))) fail("missing (interactive)/app/onboarding/page.tsx");
  if (!existsSync(join(root, "web/app/(interactive)/layout.tsx"))) fail("missing (interactive)/layout.tsx");
  if (existsSync(join(root, "web/app/(product)/app/onboarding/page.tsx"))) fail("old (product)/app/onboarding still present");
  console.log("interactive group verification passed");
} else if (gate === "popup") {
  const intro = read("web/components/onboarding/onboarding-intro.tsx");
  assertAll(intro, ["showModal", "dialog", "lane"], "intro popup");
  const page = read("web/app/(interactive)/app/onboarding/page.tsx");
  assertAll(page, ["OnboardingIntro"], "onboarding page renders popup");
  console.log("intro popup verification passed");
} else if (gate === "lane") {
  const page = read("web/app/(interactive)/app/onboarding/page.tsx");
  const fields = ["studio_name", "tagline", "brand_color", "content_type", "guided", "fast", "channel_name", "audience", "season", "episode", "Marketing", "Creative", "Production", "Social", "lane"];
  assertAll(page, fields, "lane-theory §2 spine fields");
  const presets = ["film", "documentary", "advertising"];
  const lower = page.toLowerCase();
  for (const preset of presets) {
    if (!lower.includes(preset)) fail(`lane-theory §2 spine: missing channel preset ${JSON.stringify(preset)}`);
  }
  const actions = read("web/app/(product)/actions.ts");
  assertAll(actions, ["studio_identity", "channel_setup", "department_setup"], "onboarding action payloads");
  console.log("lane coverage verification passed");
} else if (gate === "typecheck") {
  npm("typecheck");
  console.log("typecheck verification passed");
} else if (gate === "lint") {
  npm("lint");
  console.log("lint verification passed");
} else if (gate === "tests") {
  const result = spawnSync("npm", ["test"], { cwd: join(root, "web"), encoding: "utf8", stdio: "pipe" });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    fail(`npm test exited ${result.status}`);
  }
  if (!/Tests\s+\d+ passed/.test(result.stdout)) fail("vitest summary missing pass count");
  if (/failed/.test(result.stdout)) fail("vitest reports failures");
  console.log("tests verification passed");
} else {
  fail(`unknown gate ${JSON.stringify(gate)}`);
}
