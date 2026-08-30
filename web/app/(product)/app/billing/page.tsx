import { getWorkspaceContext } from "@/lib/studio/workspace";
import { PrelineCard } from "@/components/blocks/preline/preline-card";
import { FlowbiteBadge } from "@/components/blocks/flowbite/flowbite-badge";
import { KometaStats, type StatItem } from "@/components/blocks/kometa/kometa-stats";

export const metadata = { title: "Credits & Billing" };

export default async function BillingPage() {
  const { supabase } = await getWorkspaceContext();
  const [{ data: account }, { data: ledger }, { data: products }] = await Promise.all([
    supabase.from("credit_accounts").select("available, reserved, debt, updated_at").single(),
    supabase.from("credit_ledger").select("id, amount, entry_type, created_at, metadata").order("created_at", { ascending: false }).limit(30),
    supabase.from("commerce_products").select("key, name, description, kind, credit_amount, catalog_agent_id").eq("active", true),
  ]);

  const stats: StatItem[] = [
    {
      label: "Available Credits",
      value: String(account?.available ?? 0),
      subtext: "Ready for generation jobs",
    },
    {
      label: "Reserved Credits",
      value: String(account?.reserved ?? 0),
      subtext: account?.debt ? `${account.debt} credit debt after refund` : "Allocated for active tasks",
    },
  ];

  return (
    <section className="product-page shell" data-archetype="B3-B">
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text">
          Spend stays visible.
        </h1>
        <p className="text-base text-text-muted font-body">
          Credits, packs, protected hires, and every ledger entry in one place.
        </p>
      </div>

      <div className="mb-8">
        <KometaStats stats={stats} columns={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <PrelineCard
            kicker="Stripe Checkout"
            title="Credit packs & protected hires"
            subtitle="Top up your studio balance"
          >
            {products?.length ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.key} className="p-4 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <strong className="font-display text-sm text-text block">
                        {product.name}
                      </strong>
                      <p className="text-xs text-text-muted font-body">
                        {product.description}
                      </p>
                    </div>
                    <form action="/api/checkout" method="post">
                      <input type="hidden" name="product" value={product.key} />
                      <button className="button button-primary text-xs" type="submit">
                        Buy with Stripe
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">Checkout catalog is not configured yet.</p>
            )}
          </PrelineCard>
        </div>

        <div className="space-y-6">
          <PrelineCard
            kicker="Immutable Accounting"
            title="Transaction Ledger"
            subtitle={`${ledger?.length ?? 0} recent balance entries`}
          >
            {ledger?.length ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ledger.map((entry) => (
                  <div key={entry.id} className="p-3 border border-border-2 bg-surface-2 rounded-sm flex items-center justify-between text-xs font-mono">
                    <div>
                      <strong className="text-text capitalize block">{entry.entry_type.replaceAll("_", " ")}</strong>
                      <small className="text-text-faint">{new Date(entry.created_at).toLocaleString()}</small>
                    </div>
                    <FlowbiteBadge color={entry.amount >= 0 ? "lime" : "amber"} size="sm">
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} credits
                    </FlowbiteBadge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted font-body">No ledger activity yet.</p>
            )}
          </PrelineCard>
        </div>
      </div>
    </section>
  );
}
