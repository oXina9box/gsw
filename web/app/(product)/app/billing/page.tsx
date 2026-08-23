import { getWorkspaceContext } from "@/lib/studio/workspace";

export const metadata = { title: "Credits & Billing" };

export default async function BillingPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ data: account }, { data: ledger }, { data: products }, { data: purchases }] = await Promise.all([
    supabase.from("credit_accounts").select("available, reserved, debt, updated_at").single(),
    supabase.from("credit_ledger").select("id, amount, entry_type, created_at, metadata").order("created_at", { ascending: false }).limit(30),
    supabase.from("commerce_products").select("key, name, description, kind, credit_amount, catalog_agent_id").eq("active", true),
    supabase.from("purchases").select("id, product_key, status, created_at").order("created_at", { ascending: false }).limit(20),
  ]);
  return <section className="product-page shell">
    <h1>Spend stays visible.</h1>
    <div className="credit-hero"><div><strong>{account?.available ?? 0}</strong><span>available credits</span></div><div><strong>{account?.reserved ?? 0}</strong><span>reserved for active work{account?.debt ? ` · ${account.debt} credit debt after refund` : ""}</span></div></div>
    <div className="workspace-split"><section className="panel"><h2>Credit packs & protected hires</h2>{products?.length ? <div className="catalog-list">{products.map((product) => <article className="catalog-row" key={product.key}><div><strong>{product.name}</strong><p className="muted">{product.description}</p></div><form action="/api/checkout" method="post"><input type="hidden" name="product" value={product.key} /><button className="button button-primary" type="submit">Buy with Stripe</button></form></article>)}</div> : <div className="empty-state"><p>Checkout catalog is not configured yet.</p></div>}</section><section className="panel"><h2>Ledger</h2>{ledger?.length ? <ul className="event-list">{ledger.map((entry) => <li key={entry.id}><strong>{entry.entry_type}</strong><span>{entry.amount > 0 ? "+" : ""}{entry.amount}</span><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString()}</time></li>)}</ul> : <p className="muted">No credit activity.</p>}<h2 className="subhead">Purchases</h2>{purchases?.length ? <ul className="event-list">{purchases.map((purchase) => <li key={purchase.id}><strong>{purchase.product_key}</strong><span>{purchase.status}</span><time dateTime={purchase.created_at}>{new Date(purchase.created_at).toLocaleString()}</time></li>)}</ul> : <p className="muted">No purchases.</p>}</section></div>
  </section>;
}
