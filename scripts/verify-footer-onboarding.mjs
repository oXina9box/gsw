#!/usr/bin/env node
// Gate oracle for the popup onboarding and modal signup task. Usage: node scripts/verify-footer-onboarding.mjs <gate>
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
    fail(`npm run ${script} failed with code ${result.status}`);
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
  assertAll(read("web/components/shell/site-footer.tsx"), ["GemLogo"], "site footer");
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
    "SignOutButton",
  ];
  assertAll(footer, required, "footer links");
  console.log("footer verification passed");
} else if (gate === "authmodal") {
  if (!existsSync(join(root, "web/components/auth/auth-modal.tsx"))) fail("missing auth-modal.tsx");
  const modal = read("web/components/auth/auth-modal.tsx");
  assertAll(modal, ["AuthModal", "openAuthModal", "dialog", "signup", "login"], "auth modal component");
  const marketingLayout = read("web/app/(marketing)/layout.tsx");
  assertAll(marketingLayout, ["AuthModal"], "marketing layout mounts AuthModal");
  console.log("auth modal verification passed");
} else if (gate === "nosignuppage") {
  if (existsSync(join(root, "web/app/(auth)/signup/page.tsx"))) fail("standalone (auth)/signup/page.tsx still exists");
  const nextConfig = read("web/next.config.ts");
  assertAll(nextConfig, ['source: "/signup"', "destination:"], "next.config.ts signup redirect");
  console.log("signup page removal verified");
} else if (gate === "onboardingmodal") {
  if (!existsSync(join(root, "web/components/onboarding/onboarding-modal.tsx"))) fail("missing onboarding-modal.tsx");
  const modal = read("web/components/onboarding/onboarding-modal.tsx");
  const fields = ["studio_name", "tagline", "brand_color", "content_type", "channel_name", "audience", "season", "Marketing", "Creative", "Production", "Social"];
  assertAll(modal, fields, "onboarding modal spine fields");
  const presets = ["film", "documentary", "advertising"];
  const lower = modal.toLowerCase();
  for (const preset of presets) {
    if (!lower.includes(preset)) fail(`onboarding modal missing preset ${preset}`);
  }
  console.log("onboarding modal verification passed");
} else if (gate === "productmodal") {
  const layout = read("web/app/(product)/layout.tsx");
  assertAll(layout, ["shouldRedirectToOnboarding", "OnboardingModal", "onboarding_profiles"], "product layout modal");
  console.log("product layout modal verification passed");
} else if (gate === "nointeractivepage") {
  if (existsSync(join(root, "web/app/(interactive)/app/onboarding/page.tsx"))) fail("standalone interactive onboarding page still exists");
  if (existsSync(join(root, "web/app/(interactive)"))) fail("interactive route group still exists");
  console.log("interactive page removal verified");
} else if (gate === "contracts") {
  const nav = read("web/lib/studio/navigation.ts");
  assertAll(nav, ['["/signup", "Unknown User", "redirect-to-/?auth=signup"]', '["/app/onboarding", "Front Office", "redirect-to-/app"]'], "navigation route contracts");
  console.log("route contracts verification passed");
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
