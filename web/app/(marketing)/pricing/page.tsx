import Link from "next/link";
import { PRO_PLANS, BYOK_PLANS, SELF_HOST_EDITION, PAYROLL_BUDGET_CATEGORIES } from "@/lib/studio/pricing";

export const metadata = {
  title: "Pricing & Editions",
  description: "Choose a Gem Studio plan for your production slate: Pro, BYOK, or Self-Host.",
};

export default function PricingPage() {
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
      <section className="pricing-section shell" aria-label="Gem Studio Pro plans">
        <div className="pricing-intro">
          <div>
            <p className="kicker">Pro Editions</p>
            <h2>Managed Cloud · All Agents Included</h2>
          </div>
          <p>
            Full studio access with bundled generation credits and all official protected agents included. You can also pair your own BYOK keys with any Pro plan.
          </p>
        </div>

        <div className="pricing-stack">
          {PRO_PLANS.map((plan) => (
            <article className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`} key={plan.id}>
              <div>
                <span className="pricing-tier">{plan.channels} · {plan.credits}</span>
                <h2>{plan.name}</h2>
                <p className="pricing-price">
                  <strong>{plan.price}</strong>
                  {plan.period ? <small>{plan.period}</small> : null}
                </p>
                <p>{plan.description}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="pricing-action">
                <Link className="button button-primary" href={`/?auth=signup&plan=${plan.id}`}>
                  {plan.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BYOK Subscriptions Section */}
      <section className="pricing-section shell" aria-label="Gem Studio BYOK plans" style={{ marginTop: "var(--space-12)" }}>
        <div className="pricing-intro">
          <div>
            <p className="kicker">BYOK Subscriptions</p>
            <h2>Pure API Execution · Zero Markup</h2>
          </div>
          <p>
            Pay only for software workspace access. Connect your direct OpenAI &amp; Anthropic accounts with zero platform credit markup and built-in Agent Payroll budget controls.
          </p>
        </div>

        <div className="pricing-stack">
          {BYOK_PLANS.map((plan) => (
            <article className="pricing-card" key={plan.id}>
              <div>
                <span className="pricing-tier">{plan.channels} · {plan.credits}</span>
                <h2>{plan.name}</h2>
                <p className="pricing-price">
                  <strong>{plan.price}</strong>
                  {plan.period ? <small>{plan.period}</small> : null}
                </p>
                <p>{plan.description}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="pricing-action">
                <Link className="button button-primary" href={`/?auth=signup&plan=${plan.id}`}>
                  {plan.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Payroll Budget Section */}
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

      {/* Self Host Section */}
      <section className="open-source-section shell" aria-labelledby="open-source-title">
        <div>
          <p className="kicker">Self Host Edition</p>
          <h2 id="open-source-title">{SELF_HOST_EDITION.name}</h2>
          <p>
            {SELF_HOST_EDITION.description} Complete data sovereignty, 100% BYOK execution, configurable channel limits, and custom 6-file agent authoring.
          </p>
          <ul className="pricing-features" style={{ margin: "var(--space-4) 0", listStyle: "none", padding: 0 }}>
            {SELF_HOST_EDITION.features.map((feature) => (
              <li key={feature} style={{ padding: "0.25rem 0" }}>✓ {feature}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link className="button button-primary" href="https://github.com/oXina9box/gem-studio" target="_blank" rel="noreferrer">
            {SELF_HOST_EDITION.cta}
          </Link>
          <Link className="button button-outline" href="/docs/self-host-community">
            Read Self-Host Guide
          </Link>
        </div>
      </section>
    </article>
  );
}
