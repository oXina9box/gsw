import { timingSafeEqual } from "node:crypto";

export function verifyWorkerAuthorization(header: string | null, secret: string | undefined) {
  const supplied = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || !supplied) return false;
  const expected = Buffer.from(secret);
  const candidate = Buffer.from(supplied);
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}
