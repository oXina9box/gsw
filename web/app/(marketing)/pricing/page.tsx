import Link from "next/link";
import { PRO_PLANS, BYOK_PLANS, SELF_HOST_EDITION, PAYROLL_BUDGET_CATEGORIES } from "@/lib/studio/pricing";
import { Reveal } from "@/components/blocks/reveal";
import { KometaPricing, type PricingTier } from "@/components/blocks/kometa/kometa-pricing";

export const metadata = {
  title: "Pricing & Editions",
  description: "Choose a Gem Studio plan for your production slate: Pro, BYOK, or Self-Host.",
};

export default function PricingPage() {
  const proTiers: PricingTier[] = PRO_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: plan.features,
    featured: plan.featured,
    actionLabel: plan.cta,
    actionHref: `/?auth=signup&plan=${plan.id}`,
    badge: plan.featured ? "Featured" : undefined,
    footnote: `${plan.channels} · ${plan.credits}`,
  }));

  const byokTiers: PricingTier[] = BYOK_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: plan.features,
    featured: false,
    actionLabel: plan.cta,
    actionHref: `/?auth=signup&plan=${plan.id}`,
    footnote: `${plan.channels} · ${plan.credits}`,
  }));

  return (
    <article className="marketing-detail pricing-page" data-archetype="A1">
      <header className="detail-hero shell">
        <p className="eyebrow"><span className="eyebrow-rule" /> Editions &amp; economics</p>
        <h1>Choose your <span>production floor.</span></h1>
        <p className="detail-lede">
          Start with managed Cloud credits, bring your own API keys, or deploy on your own infrastructure. Scale when your slate or payroll budget is ready.
        </p>
      </header>

      {/* Pro Plans Section */}
      <Reveal>
        <div className="shell">
          <KometaPricing
            kicker="Pro Editions"
            title="Managed Cloud · All Agents Included"
            lede="Full studio access with bundled generation credits and all official protected agents included. You can also pair your own BYOK keys with any Pro plan."
            tiers={proTiers}
          />
        </div>
      </Reveal>

      {/* BYOK Subscriptions Section */}
      <Reveal>
        <div className="shell">
          <KometaPricing
            kicker="BYOK Subscriptions"
            title="Pure API Execution · Zero Markup"
            lede="Pay only for software workspace access. Connect your direct OpenAI & Anthropic accounts with zero platform credit markup and built-in Agent Payroll budget controls."
            tiers={byokTiers}
          />
        </div>
      </Reveal>

      {/* Payroll Budget Section */}
      <Reveal>
        <section className="payroll-section shell" aria-labelledby="payroll-title">
          <div className="payroll-copy">
            <p className="kicker">Payroll Budget</p>
            <h2 id="payroll-title">Plan the humans &amp; agents around the pipeline.</h2>
            <p>
              Payroll budget represents the recurring financial reserves allocated for your team and model execution. Gem Studio gives you a unified control center to balance human talent and AI agent operations.
            </p>
          </div>
          <div className="payroll-ledger" aria-label="Payroll budget categories">
            {PAYROLL_BUDGET_CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <span>{cat.id}</span>
                <strong>{cat.title}</strong>
                <small>{cat.description}</small>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Self Host Section */}
      <Reveal>
        <section className="open-source-section shell" aria-labelledby="open-source-title">
          <div>
            <p className="kicker">Self Host Edition</p>
            <h2 id="open-source-title">{SELF_HOST_EDITION.name}</h2>
            <p>
              {SELF_HOST_EDITION.description} Complete data sovereignty, 100% BYOK execution, configurable channel limits, and custom 6-file agent authoring.
            </p>
            <ul className="pricing-features pricing-features-flat mt-4 mb-4">
              {SELF_HOST_EDITION.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="row-wrap">
            <Link className="button button-primary" href="https://github.com/oXina9box/gem-studio" target="_blank" rel="noreferrer">
              {SELF_HOST_EDITION.cta}
            </Link>
            <Link className="button button-outline" href="/docs/self-host-community">
              Read Self-Host Guide
            </Link>
          </div>
        </section>
      </Reveal>
    </article>
  );
}
