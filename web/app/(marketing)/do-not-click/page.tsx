import Link from "next/link";

export const metadata = { title: "Do not click", robots: { index: false, follow: false } };

export default function DoNotClickPage() {
  return <article className="marketing-detail" data-archetype="A1">
    <header className="detail-hero shell"><p className="eyebrow">You were warned</p><h1>One little <span>video.</span></h1><p className="detail-lede">A tiny easter egg for people who read all the way to the footer.</p></header>
    <section className="detail-band shell"><div style={{ width: "100%", maxWidth: "960px", margin: "0 auto", aspectRatio: "16 / 9", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}><iframe title="AI Rickroll" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" style={{ width: "100%", height: "100%", border: 0 }} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div></section>
    <section className="detail-cta shell"><h2>Back to making something real.</h2><Link className="button button-outline" href="/">Return home ↗</Link></section>
  </article>;
}
