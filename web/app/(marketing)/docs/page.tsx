import Link from "next/link";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, hire agents, run productions, and manage studio assets in Gem Studio.",
};

export default function DocsPage() {
  return (
    <article className="marketing-detail">
      <header className="detail-hero shell">
        <h1>Documentation. <span>How the Studio Operates.</span></h1>
        <p className="detail-lede">
          A complete guide to navigating the four studio modules: Front Office, Studio Floor, Asset Vault, and Account Management.
        </p>
      </header>

      <section className="detail-band shell">
        <nav aria-label="Documentation sections" style={{ marginBottom: "2rem", padding: "1rem", borderRadius: "8px", background: "var(--surface-muted, #111)", border: "1px solid var(--border-subtle, #333)" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Topics</strong>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a href="#overview" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Overview</a>
            <a href="#channels" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Channels</a>
            <a href="#productions" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Productions</a>
            <a href="#assets" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Assets</a>
            <a href="#agents" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Agents & usage</a>
            <a href="#account" style={{ color: "var(--color-primary, #60a5fa)", textDecoration: "underline" }}>Account</a>
          </div>
        </nav>

        <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <section id="overview">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Overview</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              Gem Studio connects 13 production departments into a cohesive moving-picture workflow. Each workspace is private and isolated, with strict boundaries for hired AI agents, generation keys, and media storage.
            </p>
          </section>

          <section id="channels">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Channels</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              Channels represent distinct creative outlets or series. Each channel defines its audience, cadence, content pillars, and output destinations. Productions are organized by channel to keep brand voice consistent across campaigns.
            </p>
          </section>

          <section id="productions">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Productions</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              A production progresses across 13 departments: Research, Marketing, Creative, Story, Storyboard, Script, Screenplay, AI Conversion, Video Production, Launch, Social Posting, Social Management, and Reporting. Choose between Manual, Semi-Automatic, and Automatic run modes with visible human approval gates.
            </p>
          </section>

          <section id="assets">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Assets</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              Creative assets, versioned character DNA, video shots, and audio masters are stored in private tenant-isolated storage. Signed download URLs are short-lived and enforce tenant access rules.
            </p>
          </section>

          <section id="agents">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Agents & usage</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              Agents run inside department lanes. You can bring your own provider connection; managed workspaces also expose the protected catalog. Generation is subject to workspace policy, safety caps, and (when enabled) credit reservations. Human approval gates remain in the production flow.
            </p>
          </section>

          <section id="account">
            <h2 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Account & Privacy</h2>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary, #ccc)" }}>
              Workspace owners can export their studio data manifest, manage encrypted provider connections, and request account deletion. Deletion reconciles pending work before workspace data is purged; export and deletion controls are available from Account.
            </p>
          </section>
        </div>
      </section>

      <section className="detail-cta shell">
        <h2>Ready to configure your studio?</h2>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link className="button button-primary" href="/app">Go to Workspace ↗</Link>
          <Link className="button button-outline" href="/contact">Contact Support ↗</Link>
        </div>
      </section>
    </article>
  );
}
