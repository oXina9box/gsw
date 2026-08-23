import { NextResponse } from "next/server";
import { evaluateOperationalPolicy } from "@/lib/studio/foundations";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) return NextResponse.json({ error: "Application URL is not configured" }, { status: 503 });
  const origin = new URL(configuredUrl).origin;
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin !== origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const operational = evaluateOperationalPolicy("checkout", {
    checkout: process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true" ? "enabled" : "disabled",
    maintenance: process.env.MAINTENANCE === "true",
  }, false);
  if (!operational.allowed) return NextResponse.json({ error: "Checkout is not available" }, { status: 503 });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Checkout is not configured" }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/app/billing", request.url), 303);
  const [{ data: membership }, formData] = await Promise.all([
    supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single(),
    request.formData(),
  ]);
  if (!membership) return NextResponse.json({ error: "Studio not found" }, { status: 403 });
  const productKey = String(formData.get("product") ?? "");
  const { data: product } = await supabase.from("commerce_products").select("key, kind, stripe_price_id, unit_amount, currency, credit_amount, catalog_agent_id").eq("key", productKey).eq("active", true).maybeSingle();
  if (!product?.unit_amount || !product.currency) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.kind === "agent_pack" && product.catalog_agent_id) {
    const [{ data: entitlement }, { data: existingPurchase }] = await Promise.all([
      supabase.from("agent_entitlements").select("catalog_agent_id").eq("workspace_id", membership.workspace_id).eq("catalog_agent_id", product.catalog_agent_id).maybeSingle(),
      supabase.from("purchases").select("id").eq("workspace_id", membership.workspace_id).eq("product_key", product.key).eq("status", "pending").gte("created_at", new Date(Date.now() - 35 * 60_000).toISOString()).limit(1).maybeSingle(),
    ]);
    if (entitlement || existingPurchase) return NextResponse.json({ error: "Protected agent already unlocked or checkout active" }, { status: 409 });
  }
  const { count: recentCheckouts } = await supabase.from("purchases").select("id", { count: "exact", head: true }).eq("workspace_id", membership.workspace_id).gte("created_at", new Date(Date.now() - 10 * 60_000).toISOString());
  if ((recentCheckouts ?? 0) >= 5) return NextResponse.json({ error: "Too many checkout attempts" }, { status: 429 });
  const body = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": product.stripe_price_id,
    "line_items[0][quantity]": "1",
    client_reference_id: membership.workspace_id,
    "metadata[workspace_id]": membership.workspace_id,
    "metadata[product_key]": product.key,
    success_url: `${origin}/app/billing?checkout=success`,
    cancel_url: `${origin}/app/billing?checkout=cancelled`,
    expires_at: String(Math.floor(Date.now() / 1000) + 31 * 60),
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2026-02-25.clover",
      "Idempotency-Key": `${membership.workspace_id}:${product.key}:${Math.floor(Date.now() / 60_000)}`,
    },
    body,
    cache: "no-store",
    redirect: "error",
  });
  const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !session.id || !session.url) return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  const admin = createAdminClient();
  const { error } = await admin.from("purchases").upsert({
    workspace_id: membership.workspace_id,
    product_key: product.key,
    stripe_checkout_session_id: session.id,
    unit_amount: product.unit_amount,
    currency: product.currency,
    credit_amount: product.credit_amount,
    catalog_agent_id: product.catalog_agent_id,
  }, { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true });
  if (error) {
    await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session.id)}/expire`, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, redirect: "error" });
    return NextResponse.json({ error: "Could not record checkout" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, 303);
}
