import { CAP_LIMITS, reserveCap, type CapKey } from "./foundations";

// ponytail: cap defined, enforcement at upload/worker when route lands — this helper is the seam
export function enforceCap(key: CapKey, used: number, amount = 1, policyAvailable = true) {
  return reserveCap({ key, used, amount, policyAvailable });
}

export function isCapWarning(key: CapKey, used: number, amount = 1) {
  return used + amount >= CAP_LIMITS[key].limit * CAP_LIMITS[key].warning;
}
