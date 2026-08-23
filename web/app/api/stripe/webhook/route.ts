import { createAdminClient } from "@/lib/supabase/admin";
import { stripeReversal, verifyStripeSignature } from "@/lib/stripe/webhook";

type StripeEvent = {
  id: string;
  type: string;
  data?: { object?: { id?: string; payment_status?: string; payment_intent?: string | null; amount_total?: number; amount_refunded?: number; amount?: number; currency?: string; status?: string; metadata?: { workspace_id?: string; product_key?: string } } };
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook is not configured", { status: 503 });
  if (Number(request.headers.get("content-length") ?? "0") > 1024 * 1024) return new Response("Payload too large", { status: 413 });
  const payload = await request.text();
  if (payload.length > 1024 * 1024) return new Response("Payload too large", { status: 413 });
  if (!verifyStripeSignature(payload, signature, secret)) return new Response("Invalid signature", { status: 400 });
  let event: StripeEvent;
  try { event = JSON.parse(payload) as StripeEvent; } catch { return new Response("Invalid JSON", { status: 400 }); }
  const object = event.data?.object;
  const admin = createAdminClient();
  if (["checkout.session.expired", "checkout.session.async_payment_failed"].includes(event.type)) {
    if (!event.id || !object?.id) return new Response("Invalid checkout expiry", { status: 400 });
    const { error } = await admin.rpc("fail_checkout", { target_event_id: event.id, target_event_type: event.type, target_session_id: object.id });
    return error ? new Response("Checkout expiry failed", { status: 500 }) : new Response(null, { status: 204 });
  }
  const reversal = stripeReversal(event.type, object ?? {});
  if (reversal.applicable) {
    if (!event.id || !object?.payment_intent || reversal.amount === null) return new Response("Invalid reversal", { status: 400 });
    const { error } = await admin.rpc("reverse_checkout", { target_event_id: event.id, target_event_type: event.type, target_payment_intent_id: object.payment_intent, target_amount: reversal.amount });
    return error ? new Response("Reversal failed", { status: 500 }) : new Response(null, { status: 204 });
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) return new Response(null, { status: 204 });
  if (event.type === "checkout.session.completed" && object?.payment_status !== "paid") return new Response(null, { status: 204 });
  if (!event.id || !object?.id || object.payment_status !== "paid" || !object.payment_intent || !object.amount_total || !object.currency || !object.metadata?.workspace_id || !object.metadata.product_key) return new Response("Incomplete checkout", { status: 400 });
  const { error } = await admin.rpc("fulfill_checkout_verified", {
    target_event_id: event.id,
    target_event_type: event.type,
    target_session_id: object.id,
    target_payment_intent_id: object.payment_intent,
    target_workspace: object.metadata.workspace_id,
    target_product: object.metadata.product_key,
    target_amount: object.amount_total,
    target_currency: object.currency,
  });
  if (error) return new Response("Fulfillment failed", { status: 500 });
  return new Response(null, { status: 204 });
}
