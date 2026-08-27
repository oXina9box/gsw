import Link from "next/link";
import { notFound } from "next/navigation";
import { docArticles, docsBySlug } from "@/lib/docs/content";

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
    if (block.startsWith("## ")) return <h2 key={block}>{block.slice(3)}</h2>;
    if (block.startsWith("### ")) return <h3 key={block}>{block.slice(4)}</h3>;
    if (block.startsWith("> ")) return <blockquote key={block}>{block.slice(2)}</blockquote>;
    const parts = block.split(/(\*\*[^*]+\*\*)/g);
    return <p key={block}>{parts.map((part, index) => part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</p>;
  });
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = docsBySlug[slug];
  if (!article) notFound();
  const index = docArticles.findIndex((item) => item.slug === slug);
  const previous = index > 0 ? docArticles[index - 1] : null;
  const next = index < docArticles.length - 1 ? docArticles[index + 1] : null;
  return (
    <article className="marketing-detail">
      <header className="detail-hero shell">
        <nav aria-label="Breadcrumb" className="docs-breadcrumb"><Link href="/docs">Docs</Link><span aria-hidden="true">/</span><span>{article.category}</span></nav>
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="detail-lede">{article.description}</p>
      </header>
      <section className="docs-layout shell docs-article-layout">
        <nav className="docs-nav" aria-label="Documentation sections">
          <strong>Contents</strong>
          <div className="docs-nav-links">
            <Link href="/docs">Overview</Link>
            {docArticles.map((item) => <Link className={item.slug === slug ? "is-current" : undefined} href={`/docs/${item.slug}`} key={item.slug}>{item.title}</Link>)}
          </div>
        </nav>
        <div className="docs-content docs-prose">{renderMarkdown(article.markdown)}</div>
      </section>
      <nav className="docs-pagination shell" aria-label="Article navigation">
        {previous ? <Link href={`/docs/${previous.slug}`}><small>Previous</small><span>← {previous.title}</span></Link> : <span />}
        {next ? <Link href={`/docs/${next.slug}`}><small>Next</small><span>{next.title} →</span></Link> : <span />}
      </nav>
    </article>
  );
}
