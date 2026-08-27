import Link from "next/link";

const plans = [
  {
    name: "Content Pro",
    channels: "1 Channel",
    detail: "A focused production space for one publishing channel.",
    features: ["Studio pipeline", "DNA continuity", "BYOK provider keys"],
  },
  {
    name: "Creator Pro",
    channels: "3 Channels",
    detail: "Room for a connected slate of formats and audiences.",
    features: ["Everything in Content Pro", "Shared production library", "Priority creative workflows"],
  },
  {
    name: "Studio Pro",
    channels: "5 Channels",
    detail: "A complete operating system for an active AI film studio.",
    features: ["Everything in Creator Pro", "Protected agent catalog", "Add-on channels available"],
    contact: true,
  },
  {
    name: "Creator Community",
    channels: "Self-host · 3 Channels",
    detail: "Run Gem Studio on your own infrastructure.",
    features: ["Self-hosted deployment", "Bring your own provider keys", "Community documentation"],
    community: true,
  },
];

export const metadata = {
  title: "Pricing & Editions",
  description: "Choose a Gem Studio plan for your production slate.",
};

export default function PricingPage() {
  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <h1>Plans for work that ships.</h1>
        <p className="detail-lede">Start one channel. Grow into a studio when your slate needs it.</p>
      </header>
      <section className="pricing-section shell" aria-label="Gem Studio plans">
        <div className="pricing-stack">
          {plans.map((plan) => (
            <article className="pricing-card" key={plan.name}>
              <div>
                <span className="pricing-tier">{plan.channels}</span>
                <h2>{plan.name}</h2>
                <p>{plan.detail}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="pricing-action">
                <Link className="button button-primary" href="/signup">Create Studio</Link>
                {plan.contact ? <Link className="button button-outline" href="/contact">Contact for add-on channels</Link> : null}
                {plan.community ? <Link className="button button-outline" href="/docs">View self-host guide</Link> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
