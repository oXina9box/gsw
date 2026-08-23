import { mkdtempSync, statSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, describe, expect, it } from "vitest";
import { assemblyArguments } from "./ffmpeg";

const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const available = spawnSync(ffmpeg, ["-version"], { stdio: "ignore" }).status === 0;
const directory = mkdtempSync(path.join(tmpdir(), "gem-ffmpeg-test-"));
afterAll(() => rm(directory, { recursive: true, force: true }));

describe.runIf(available)("FFmpeg assembly", () => {
  it("assembles two compatible MP4 clips with the production arguments", () => {
    const clips = ["red", "blue"].map((color) => {
      const target = path.join(directory, `${color}.mp4`);
      const result = spawnSync(ffmpeg, ["-nostdin", "-v", "error", "-f", "lavfi", "-i", `color=c=${color}:s=64x64:d=0.25`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-y", target]);
      expect(result.status).toBe(0);
      return target;
    });
    const manifest = path.join(directory, "concat.txt");
    const output = path.join(directory, "master.mp4");
    writeFileSync(manifest, clips.map((clip) => `file '${clip}'`).join("\n"));
    const result = spawnSync(ffmpeg, assemblyArguments(manifest, output), { encoding: "utf8", timeout: 10_000 });
    expect(result.status, result.stderr).toBe(0);
    expect(statSync(output).size).toBeGreaterThan(0);
  });
});
