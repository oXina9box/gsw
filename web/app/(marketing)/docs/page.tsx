import Link from "next/link";
import { docArticles } from "@/lib/docs/content";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, run productions, and manage Gem Studio.",
};

const categories = [...new Set(docArticles.map((article) => article.category))];

export default function DocsPage() {
  return (
    <article className="marketing-detail" data-archetype="A2">
      <header className="detail-hero shell">
        <p className="eyebrow">Documentation</p>
        <h1>How the Studio <span>operates.</span></h1>
        <p className="detail-lede">A practical guide to Gem Studio&apos;s pipeline, continuity system, agents, and deployment boundaries.</p>
      </header>
      <section className="docs-layout shell" aria-label="Documentation index">
        <nav className="docs-nav" aria-label="Documentation sections">
          <strong>Contents</strong>
          <div className="docs-nav-links">
            <Link href="/docs">Overview</Link>
            {categories.map((category) => (
              <div key={category}>
                <span className="docs-nav-category">{category}</span>
                {docArticles.filter((article) => article.category === category).map((article) => (
                  <Link key={article.slug} href={`/docs/${article.slug}`}>{article.title}</Link>
                ))}
              </div>
            ))}
          </div>
        </nav>
        <div className="docs-content">
          <section className="docs-section">
            <h2>Start here</h2>
            <p>Gem Studio connects thirteen production departments into one private, auditable workflow. Pick a topic to learn how each part fits together.</p>
          </section>
          {categories.map((category) => (
            <section className="docs-section" key={category}>
              <h2>{category}</h2>
              <div className="docs-article-list">
                {docArticles.filter((article) => article.category === category).map((article) => (
                  <Link className="docs-article-link" href={`/docs/${article.slug}`} key={article.slug}>
                    <span><strong>{article.title}</strong><small>{article.description}</small></span><span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </article>
  );
}
