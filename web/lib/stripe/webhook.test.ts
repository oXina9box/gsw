import { createHmac, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { stripeReversal, verifyStripeSignature } from "./webhook";

describe("Stripe webhook signature", () => {
  it("accepts a current valid v1 signature", () => {
    const payload = '{"id":"evt_1"}';
    const secret = randomBytes(32).toString("hex");
    const now = 2_000_000_000;
    const signature = createHmac("sha256", secret).update(`${now}.${payload}`).digest("hex");
    expect(verifyStripeSignature(payload, `t=${now},v1=${signature}`, secret, now)).toBe(true);
  });

  it("rejects altered and stale payloads", () => {
    const secret = randomBytes(32).toString("hex");
    const now = 2_000_000_000;
    const signature = createHmac("sha256", secret).update(`${now}.original`).digest("hex");
    expect(verifyStripeSignature("changed", `t=${now},v1=${signature}`, secret, now)).toBe(false);
    expect(verifyStripeSignature("original", `t=${now - 301},v1=${signature}`, secret, now)).toBe(false);
  });
});

describe("Stripe reversals", () => {
  it("accepts cumulative refunds and only lost closed disputes", () => {
    expect(stripeReversal("charge.refunded", { amount_refunded: 500 })).toEqual({ applicable: true, amount: 500 });
    expect(stripeReversal("charge.dispute.closed", { status: "lost", amount: 1200 })).toEqual({ applicable: true, amount: 1200 });
    expect(stripeReversal("charge.dispute.closed", { status: "won", amount: 1200 })).toEqual({ applicable: false, amount: null });
    expect(stripeReversal("charge.refunded", { amount_refunded: 0 })).toEqual({ applicable: true, amount: null });
  });
});
