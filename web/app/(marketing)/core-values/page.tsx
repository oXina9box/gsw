import Link from "next/link";
import { notFound } from "next/navigation";
export const metadata = { title: "Core Values" };
const values = [
  ["Continuity First", "Every decision carries forward through release.", "Use versioned DNA and traceable approvals."],
  ["Bounded Automation", "Automation moves inside human-set limits.", "Make approval gates, provider limits, and credit caps visible."],
  ["Private Ownership", "Creators retain control of studio material.", "Keep keys encrypted, workspace boundaries explicit, exports available."],
  ["Human Direction", "People decide what ships.", "Treat review as creative direction, not checkbox."],
] as const;
export default function CoreValuesPage() { if (process.env.SITE_CONTENT_APPROVED !== "true") notFound(); return <article className="reading-page shell" data-archetype="A2"><p className="kicker">Core values</p><h1>What guides the studio.</h1><p className="lede">Principles shape briefs, handoffs, AI use, review, and release.</p><div className="grid">{values.map(([title, principle, practice]) => <section className="card" key={title}><p className="kicker">Operating value</p><h2>{title}</h2><p>{principle}</p><p>{practice}</p></section>)}</div><div className="actions"><Link className="button button-primary" href="/signup">Create your account ↗</Link><Link className="button button-outline" href="/">Back to the studio</Link></div></article>; }
