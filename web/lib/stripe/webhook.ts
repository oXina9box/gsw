import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeSignature(payload: string, header: string, secret: string, now = Math.floor(Date.now() / 1000), tolerance = 300) {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > tolerance || signatures.length === 0) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest();
  return signatures.some((signature) => {
    if (!/^[a-f\d]{64}$/i.test(signature)) return false;
    const candidate = Buffer.from(signature, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

export function stripeReversal(eventType: string, object: { amount_refunded?: number; amount?: number; status?: string }) {
  const applicable = eventType === "charge.refunded" || (eventType === "charge.dispute.closed" && object.status === "lost");
  const amount = eventType === "charge.refunded" ? object.amount_refunded : object.amount;
  return { applicable, amount: applicable && Number.isSafeInteger(amount) && Number(amount) > 0 ? Number(amount) : null };
}
