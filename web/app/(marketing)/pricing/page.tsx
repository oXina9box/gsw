import Link from "next/link";

const plans = [
  {
    id: "cloud-1",
    name: "Content Pro",
    channels: "1 Channel",
    price: "For focused publishing",
    detail: "A focused production space for one publishing channel.",
    features: ["Studio pipeline", "DNA continuity", "Managed Cloud credits", "Optional BYOK key pairing"],
    cta: "Start with Content Pro",
  },
  {
    id: "cloud-2",
    name: "Creator Pro",
    channels: "3 Channels",
    price: "For a connected slate",
    detail: "Room for a connected slate of formats and audiences.",
    features: ["Everything in Content Pro", "Shared production library", "Priority creative workflows", "Hybrid Cloud + BYOK"],
    cta: "Start with Creator Pro",
    featured: true,
  },
  {
    id: "cloud-3",
    name: "Studio Pro",
    channels: "5 Channels",
    price: "For a working studio",
    detail: "A complete operating system for an active AI film studio.",
    features: ["Everything in Creator Pro", "Protected agent catalog", "Add-on channels available", "Custom BYOK routing"],
    contact: true,
    cta: "Start with Studio Pro",
  },
  {
    id: "byok",
    name: "BYOK Independent",
    channels: "Bring Your Own Keys",
    price: "Pure API execution",
    detail: "Zero software markup. Connect your direct OpenAI & Anthropic accounts.",
    features: ["Full 13-stage studio workflow", "Zero platform credit markup", "Direct rate limits & provider billing", "Stackable with Cloud tiers"],
    cta: "Configure BYOK Studio",
  },
];

export const metadata = {
  title: "Pricing & Editions",
  description: "Choose a Gem Studio plan for your production slate.",
};

export default function PricingPage() {
  return (
    <article className="marketing-detail pricing-page" data-archetype="A1">
      <header className="detail-hero shell">
        <p className="eyebrow"><span className="eyebrow-rule" /> Editions &amp; economics</p>
        <h1>Choose your <span>production floor.</span></h1>
        <p className="detail-lede">Start with one channel or bring your own API keys. Scale the workspace when your slate, team, or payroll budget is ready.</p>
      </header>

      <section className="pricing-section shell" aria-label="Gem Studio plans">
        <div className="pricing-intro">
          <div>
            <p className="kicker">Subscription map</p>
            <h2>Software for the studio. Budget for the people.</h2>
          </div>
          <p>
            Subscriptions configure Gem Studio workspace access, protected agent configurations, and product operations.
            Generation uses transparent metered credits or direct BYOK provider keys. Pre-launch beta accounts receive access with dry billing verification.
          </p>
        </div>

        <div className="pricing-stack">
          {plans.map((plan) => (
            <article className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`} key={plan.id}>
              <div>
                <span className="pricing-tier">{plan.channels}</span>
                <h2>{plan.name}</h2>
                <p className="pricing-price">{plan.price}</p>
                <p>{plan.detail}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="pricing-action">
                <Link className="button button-primary" href={`/?auth=signup&plan=${plan.id}`}>
                  {plan.cta}
                </Link>
                {plan.contact ? <Link className="button button-outline" href="/contact">Contact for add-on channels</Link> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="payroll-section shell" aria-labelledby="payroll-title">
        <div className="payroll-copy">
          <p className="kicker">Payroll budget</p>
          <h2 id="payroll-title">Plan the humans around the pipeline.</h2>
          <p>Payroll budget means the money you reserve for people and recurring contractor work. Gem Studio does not replace that line item; it gives your team one place to coordinate the work.</p>
        </div>
        <div className="payroll-ledger" aria-label="Payroll budget categories">
          <div><span>01</span><strong>Creative</strong><small>Writing · direction · story</small></div>
          <div><span>02</span><strong>Production</strong><small>Shots · edits · review</small></div>
          <div><span>03</span><strong>Operations</strong><small>Release · community · growth</small></div>
        </div>
      </section>

      <section className="open-source-section shell" aria-labelledby="open-source-title">
        <div>
          <p className="kicker">Open core &amp; Self-hosting</p>
          <h2 id="open-source-title">Prefer to run it yourself?</h2>
          <p>Download Gem Studio, bring your own infrastructure and provider keys, and keep the production floor close to your team.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link className="button button-primary" href="https://github.com/oXina9box/gem-studio" target="_blank" rel="noreferrer">
            View on GitHub ↗
          </Link>
          <Link className="button button-outline" href="/docs">
            Read Self-Host Guide
          </Link>
        </div>
      </section>
    </article>
  );
}
