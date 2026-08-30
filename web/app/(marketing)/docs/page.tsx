import Link from "next/link";
import { docArticles } from "@/lib/docs/content";
import { Reveal } from "@/components/blocks/reveal";
import { PrelineSidebar, type SidebarSection } from "@/components/blocks/preline/preline-sidebar";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, run productions, and manage Gem Studio.",
};

const categories = [...new Set(docArticles.map((article) => article.category))];

export default function DocsPage() {
  const sidebarSections: SidebarSection[] = [
    {
      title: "Navigation",
      items: [
        {
          id: "overview",
          label: "Overview",
          href: "/docs",
          active: true,
        },
      ],
    },
    ...categories.map((category) => ({
      title: category,
      items: docArticles
        .filter((article) => article.category === category)
        .map((article) => ({
          id: article.slug,
          label: article.title,
          href: `/docs/${article.slug}`,
        })),
    })),
  ];

  return (
    <article className="marketing-detail" data-archetype="A2">
      <header className="detail-hero shell">
        <p className="eyebrow">Documentation</p>
        <h1>How the Studio <span>operates.</span></h1>
        <p className="detail-lede">
          A practical guide to Gem Studio&apos;s pipeline, continuity system, agents, and deployment boundaries.
        </p>
      </header>

      <Reveal>
        <div className="shell flex flex-col md:flex-row gap-8 lg:gap-12 py-8">
          <PrelineSidebar sections={sidebarSections} className="shrink-0" />

          <div className="flex-1 space-y-8">
            <section className="p-6 border border-border bg-surface rounded-md space-y-3">
              <h2 className="font-display text-2xl font-bold text-text">Start here</h2>
              <p className="text-sm text-text-muted font-body leading-relaxed">
                Gem Studio connects thirteen production departments into one private, auditable workflow. Pick a topic to learn how each part fits together.
              </p>
            </section>

            {categories.map((category) => (
              <section className="p-6 border border-border bg-surface rounded-md space-y-4" key={category}>
                <h2 className="font-display text-xl font-semibold text-text">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docArticles
                    .filter((article) => article.category === category)
                    .map((article) => (
                      <Link
                        className="p-4 border border-border-2 bg-surface-2 rounded-sm flex flex-col justify-between hover:border-cyan hover:bg-surface-3 transition-colors duration-150"
                        href={`/docs/${article.slug}`}
                        key={article.slug}
                      >
                        <div className="space-y-1">
                          <strong className="font-display text-sm font-semibold text-text block">
                            {article.title}
                          </strong>
                          <p className="text-xs text-text-muted font-body line-clamp-2">
                            {article.description}
                          </p>
                        </div>
                        <span className="text-cyan text-xs font-mono mt-3 self-end">↗</span>
                      </Link>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Reveal>
    </article>
  );
}
