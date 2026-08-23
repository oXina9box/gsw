export const MAX_MASTER_BYTES = 100 * 1024 * 1024;

export function assemblyArguments(manifest: string, output: string) {
  return ["-nostdin", "-v", "error", "-xerror", "-abort_on", "empty_output", "-y", "-threads", "2", "-timelimit", "150", "-protocol_whitelist", "file,pipe", "-f", "concat", "-safe", "0", "-i", manifest, "-c:v", "libx264", "-c:a", "aac", "-fs", String(MAX_MASTER_BYTES), "-movflags", "+faststart", output];
}
