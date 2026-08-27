import Link from "next/link";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, hire agents, run productions, and manage studio assets in Gem Studio.",
};

export default function DocsPage() {
  return (
    <article className="marketing-detail" data-archetype="A2">
      <header className="detail-hero shell">
        <h1>Documentation. <span>How the Studio Operates.</span></h1>
        <p className="detail-lede">
          A complete guide to navigating the four studio modules: Front Office, Studio Floor, Asset Vault, and Account Management.
        </p>
      </header>

      <section className="docs-layout shell">
        <nav className="docs-nav" aria-label="Documentation sections">
          <strong>Topics</strong>
          <div className="docs-nav-links">
            <a href="#overview">Overview</a>
            <a href="#channels">Channels</a>
            <a href="#productions">Productions</a>
            <a href="#assets">Assets</a>
            <a href="#agents">Agents & usage</a>
            <a href="#account">Account</a>
          </div>
        </nav>

        <div className="docs-content">
          <section className="docs-section" id="overview">
            <h2>Overview</h2>
            <p>
              Gem Studio connects 13 production departments into a cohesive moving-picture workflow. Each workspace is private and isolated, with strict boundaries for hired AI agents, generation keys, and media storage.
            </p>
          </section>

          <section className="docs-section" id="channels">
            <h2>Channels</h2>
            <p>
              Channels represent distinct creative outlets or series. Each channel defines its audience, cadence, content pillars, and output destinations. Productions are organized by channel to keep brand voice consistent across campaigns.
            </p>
          </section>

          <section className="docs-section" id="productions">
            <h2>Productions</h2>
            <p>
              A production progresses across 13 departments: Research, Marketing, Creative, Story, Storyboard, Script, Screenplay, AI Conversion, Video Production, Launch, Social Posting, Social Management, and Reporting. Choose between Manual, Semi-Automatic, and Automatic run modes with visible human approval gates.
            </p>
          </section>

          <section className="docs-section" id="assets">
            <h2>Assets</h2>
            <p>
              Creative assets, versioned character DNA, video shots, and audio masters are stored in private tenant-isolated storage. Signed download URLs are short-lived and enforce tenant access rules.
            </p>
          </section>

          <section className="docs-section" id="agents">
            <h2>Agents & usage</h2>
            <p>
              Agents run inside department lanes. You can bring your own provider connection; managed workspaces also expose the protected catalog. Generation is subject to workspace policy, safety caps, and (when enabled) credit reservations. Human approval gates remain in the production flow.
            </p>
          </section>

          <section className="docs-section" id="account">
            <h2>Account & Privacy</h2>
            <p>
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
