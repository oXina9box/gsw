// ponytail: inline styles retained — lint passes, extract to CSS module if drift flagged
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
    <article className="marketing-detail">
      <header className="detail-hero shell">
        <h1>Editions & Pricing. <span>Clear boundaries, full control.</span></h1>
        <p className="detail-lede">
          Choose between our managed multi-department cloud and self-hosted private deployments.
        </p>
      </header>

      <section className="detail-band shell">
        <div className="detail-grid shell" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          <article style={{ padding: "2rem", borderRadius: "8px", background: "var(--surface-muted, #111)", border: "1px solid var(--border-subtle, #333)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted, #888)" }}>Self-Hosted Edition</span>
              <h2 style={{ fontSize: "1.75rem", marginTop: "0.5rem", marginBottom: "1rem" }}>Free / Community</h2>
              <p style={{ color: "var(--text-secondary, #ccc)", marginBottom: "1.5rem" }}>
                Run Gem Studio on your own infrastructure with local PostgreSQL and bring-your-own provider keys.
              </p>
              <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary, #ccc)", fontSize: "0.9375rem" }}>
                <li>Local single-tenant deployment</li>
                <li>Unlimited local channels and lanes</li>
                <li>Standard custom agent definitions (6-file contract)</li>
                <li>Storage bounded only by your local disk</li>
                <li>Full commercial output rights</li>
                <li>Community documentation & issue tracker</li>
              </ul>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <Link className="button button-outline" href="/docs" style={{ width: "100%", textAlign: "center" }}>
                View Setup Guide ↗
              </Link>
            </div>
          </article>

          <article style={{ padding: "2rem", borderRadius: "8px", background: "var(--surface-muted, #151515)", border: "1px solid var(--color-primary, #3b82f6)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary, #60a5fa)" }}>Managed Cloud</span>
              <h2 style={{ fontSize: "1.75rem", marginTop: "0.5rem", marginBottom: "1rem" }}>Creator Studio</h2>
              <p style={{ color: "var(--text-secondary, #ccc)", marginBottom: "1.5rem" }}>
                Fully managed cloud environment with private tenant isolation, protected agent catalog, and managed queues.
              </p>
              <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary, #ccc)", fontSize: "0.9375rem" }}>
                <li>{storageLimitGb} GB isolated creative asset storage</li>
                <li>Up to {concurrentJobsLimit} concurrent workspace generation jobs</li>
                <li>Access to official protected agents catalog</li>
                <li>Automated encrypted credential vault</li>
                <li>Full commercial output rights</li>
                <li>Direct support & automated backup rehearsals</li>
              </ul>
            </div>
            <div style={{ marginTop: "2rem" }}>
              {signupsEnabled ? (
                <Link className="button button-primary" href="/signup" style={{ width: "100%", textAlign: "center" }}>
                  Get Started ↗
                </Link>
              ) : (
                <button disabled className="button button-outline" style={{ width: "100%", opacity: 0.6, cursor: "not-allowed" }}>
                  Request access (Invite only)
                </button>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="detail-cta shell">
        <h2>Have custom enterprise or high-volume studio requirements?</h2>
        <Link className="button button-outline" href="/contact">Talk to our team ↗</Link>
      </section>
    </article>
  );
}
