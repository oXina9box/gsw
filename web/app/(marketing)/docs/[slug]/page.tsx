import { notFound } from "next/navigation";
import { docArticles, docsBySlug } from "@/lib/docs/content";
import { Reveal } from "@/components/blocks/reveal";
import { FlowbiteBreadcrumb } from "@/components/blocks/flowbite/flowbite-breadcrumb";
import { FlowbitePagination } from "@/components/blocks/flowbite/flowbite-pagination";
import { PrelineSidebar, type SidebarSection } from "@/components/blocks/preline/preline-sidebar";

export function generateStaticParams() {
  return docArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = docsBySlug[slug];
  return article ? { title: `${article.title} · Documentation`, description: article.description } : {};
}

function renderMarkdown(markdown: string) {
  return markdown.split("\n\n").map((block) => {
    if (block.startsWith("## ")) return <h2 key={block} className="font-display text-2xl font-bold text-text mt-8 mb-4">{block.slice(3)}</h2>;
    if (block.startsWith("### ")) return <h3 key={block} className="font-display text-xl font-semibold text-text mt-6 mb-3">{block.slice(4)}</h3>;
    if (block.startsWith("> ")) return <blockquote key={block} className="p-4 border-l-2 border-amber bg-surface-2 text-text-muted italic my-4">{block.slice(2)}</blockquote>;
    const parts = block.split(/(\*\*[^*]+\*\*)/g);
    return <p key={block} className="text-sm sm:text-base text-text-muted font-body leading-relaxed mb-4">{parts.map((part, index) => part.startsWith("**") ? <strong key={index} className="text-text font-semibold">{part.slice(2, -2)}</strong> : part)}</p>;
  });
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = docsBySlug[slug];
  if (!article) notFound();
  const index = docArticles.findIndex((item) => item.slug === slug);
  const previous = index > 0 ? docArticles[index - 1] : null;
  const next = index < docArticles.length - 1 ? docArticles[index + 1] : null;

  const categories = [...new Set(docArticles.map((a) => a.category))];
  const sidebarSections: SidebarSection[] = [
    {
      title: "Navigation",
      items: [
        {
          id: "overview",
          label: "Overview",
          href: "/docs",
        },
      ],
    },
    ...categories.map((cat) => ({
      title: cat,
      items: docArticles
        .filter((a) => a.category === cat)
        .map((a) => ({
          id: a.slug,
          label: a.title,
          href: `/docs/${a.slug}`,
          active: a.slug === slug,
        })),
    })),
  ];

  return (
    <article className="marketing-detail">
      <header className="detail-hero shell">
        <FlowbiteBreadcrumb
          homeHref="/docs"
          homeLabel="Docs"
          items={[
            { label: article.category },
            { label: article.title, current: true },
          ]}
          className="mb-4"
        />
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="detail-lede">{article.description}</p>
      </header>

      <Reveal>
        <div className="shell flex flex-col md:flex-row gap-8 lg:gap-12 py-8">
          <PrelineSidebar sections={sidebarSections} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="p-6 sm:p-8 border border-border bg-surface rounded-md">
              {renderMarkdown(article.markdown)}
            </div>

            <div className="mt-8">
              <FlowbitePagination
                currentPage={index + 1}
                totalPages={docArticles.length}
                prevHref={previous ? `/docs/${previous.slug}` : undefined}
                nextHref={next ? `/docs/${next.slug}` : undefined}
                prevLabel={previous ? `← ${previous.title}` : undefined}
                nextLabel={next ? `${next.title} →` : undefined}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
