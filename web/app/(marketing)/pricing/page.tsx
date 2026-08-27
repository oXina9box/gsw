import Link from "next/link";
import { CAP_LIMITS } from "@/lib/studio/caps";

export const metadata = {
  title: "Pricing & Editions",
  description: "Compare Managed Cloud and Self-Hosted editions of Gem Studio.",
};

export default function PricingPage() {
  const signupsEnabled = process.env.NEXT_PUBLIC_SIGNUPS_ENABLED !== "false";
  const storageLimitGb = Math.round(CAP_LIMITS.storage_workspace_bytes.limit / (1024 ** 3));
  const concurrentJobsLimit = CAP_LIMITS.jobs_workspace.limit;

  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <h1>Editions & Pricing. <span>Clear boundaries, full control.</span></h1>
        <p className="detail-lede">
          Choose between our managed multi-department cloud and self-hosted private deployments.
        </p>
      </header>

      <section className="pricing-section shell">
        <div className="pricing-grid">
          <article className="pricing-card">
            <div>
              <span className="pricing-tier">Self-Hosted Edition</span>
              <h2>Free / Community</h2>
              <p>
                Run Gem Studio on your own infrastructure with local PostgreSQL and bring-your-own provider keys.
              </p>
              <ul className="pricing-features">
                <li>Local single-tenant deployment</li>
                <li>Unlimited local channels and lanes</li>
                <li>Standard custom agent definitions (6-file contract)</li>
                <li>Storage bounded only by your local disk</li>
                <li>Output rights subject to applicable license and provider terms</li>
                <li>Community documentation & issue tracker</li>
              </ul>
            </div>
            <div className="pricing-action">
              <Link className="button button-outline" href="/docs">
                View Setup Guide ↗
              </Link>
            </div>
          </article>

          <article className="pricing-card pricing-card-featured">
            <div>
              <span className="pricing-tier">Managed Cloud</span>
              <h2>Creator Studio</h2>
              <p>
                Fully managed cloud environment with private tenant isolation, protected agent catalog, and managed queues.
              </p>
              <ul className="pricing-features">
                <li>{storageLimitGb} GB isolated creative asset storage</li>
                <li>Up to {concurrentJobsLimit} concurrent workspace generation jobs</li>
                <li>Access to official protected agents catalog</li>
                <li>Automated encrypted credential vault</li>
                <li>Output rights subject to applicable license and provider terms</li>
                <li>Direct support & automated backup rehearsals</li>
              </ul>
            </div>
            <div className="pricing-action">
              {signupsEnabled ? (
                <Link className="button button-primary" href="/signup">
                  Get Started ↗
                </Link>
              ) : (
                <button disabled className="button button-outline">
                  Request access (Invite only)
                </button>
              )}
            </div>
          </article>
        </div>
        <p style={{ marginTop: "1.5rem", color: "var(--text-muted, #888)", textAlign: "center" }}>
          Public signup and checkout may be invite-only during launch. This page describes the intended editions; no purchase is completed here.
        </p>
      </section>

      <section className="detail-cta shell">
        <h2>Have custom enterprise or high-volume studio requirements?</h2>
        <Link className="button button-outline" href="/contact">Talk to our team ↗</Link>
      </section>
    </article>
  );
}
