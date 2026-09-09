import { KometaC3Section, KometaC5Section } from "@/components/blocks/kometa/kometa-approved-sections";
import { docArticles } from "@/lib/docs/content";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, run productions, and manage Gem Studio.",
};

export default function DocsPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A2">
      <header className="max-w-xl mx-auto text-center pt-6 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-lime/30 text-lime bg-lime/10">
          Documentation
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Studio Architecture & Guides
        </h1>
        <p className="text-base text-text-muted font-body mt-4">
          Understand the 13-stage pipeline, DNA continuity, GenPlay contracts, BYOK security, and self-hosting.
        </p>
      </header>

      {/* Section 1: [C3] Spotlight navigation cards derived directly from docArticles */}
      <KometaC3Section
        items={docArticles.slice(0, 4).map((article) => ({
          title: article.title,
          description: article.description,
          href: `/docs/${article.slug}`,
        }))}
      />

      {/* Section 2: [C5] Complete guide index covering all docArticles */}
      <KometaC5Section
        badge="All Guides"
        title="Complete Studio Reference"
        lede="Explore all operational guides for production pipelines, agent contracts, cryptographic security, and deployments."
        cards={docArticles.map((article) => ({
          title: article.title,
          description: article.description,
          href: `/docs/${article.slug}`,
          tag: article.category,
        }))}
        ctaHref="/pricing"
        ctaLabel="View Studio Plans & Licensing"
      />
    </article>
  );
}
