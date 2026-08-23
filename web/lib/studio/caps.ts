import { CAP_LIMITS, reserveCap, type CapKey } from "./foundations";
export { CAP_LIMITS, type CapKey };

// ponytail: cap defined, enforcement at upload/worker when route lands — this helper is the seam
export function enforceCap(key: CapKey, used: number, amount = 1, policyAvailable = true) {
  return reserveCap({ key, used, amount, policyAvailable });
}

export function isCapWarning(key: CapKey, used: number, amount = 1) {
  return used + amount >= CAP_LIMITS[key].limit * CAP_LIMITS[key].warning;
}


export function evaluateJobAdmission(input: Readonly<{ workspaceRunning: number; globalRunning: number; policyAvailable: boolean }>) {
  const workspace = enforceCap("jobs_workspace", input.workspaceRunning, 1, input.policyAvailable);
  if (!workspace.allowed) return Object.freeze({ admit: false, reason: workspace.reason });
  const global = enforceCap("jobs_global", input.globalRunning, 1, input.policyAvailable);
  return Object.freeze({ admit: global.allowed, reason: global.reason });
}

export function evaluateClipUploadAdmission(input: Readonly<{ byteSize: number; filesToday: number; bytesToday: number; policyAvailable: boolean }>) {
  const file = enforceCap("upload_file_bytes", 0, input.byteSize, input.policyAvailable);
  if (!file.allowed) return Object.freeze({ admit: false, reason: file.reason });
  const count = enforceCap("upload_workspace_day_files", input.filesToday, 1, input.policyAvailable);
  if (!count.allowed) return Object.freeze({ admit: false, reason: count.reason });
  const daily = enforceCap("upload_workspace_day_bytes", input.bytesToday, input.byteSize, input.policyAvailable);
  return Object.freeze({ admit: daily.allowed, reason: daily.reason });
}