import Link from "next/link";

const desks = [
  ["01", "Marketing department", "Find the angle.", "Turn a loose brief into a point of view, campaign shape, and reason to keep watching.", "/studio"],
  ["02", "Creative department", "Make it feel inevitable.", "Build the visual language, world, and detail that makes a frame yours.", "/studio"],
  ["03", "Production department", "Move the frame.", "Generate, direct, refine, and finish without losing the original spark.", "/system"],
  ["04", "Social workshop", "Keep it alive.", "Turn one piece of work into native formats, conversations, and feedback.", "/social-workshop"],
];

export default function HomePage() {
  return <div className="shell">
    <section className="hero"><div><p className="eyebrow">Online AI film studio · Open for briefs</p><h1>Make the <em>impossible</em> feel scheduled.</h1><p className="lede">Gem Studio brings the thinking, making, moving, and sharing of a film into one connected creative floor.</p><div className="actions"><Link className="button button-primary" href="/signup">Create your account ↗</Link><Link className="button button-outline" href="#studio">Walk the floor ↓</Link></div></div><div className="panel"><p className="kicker">Current frame / live system</p><h2>Story → frame → signal</h2><p className="muted">Every brief carries its context forward. No black box between the thought and the finished frame.</p></div></section>
    <section className="section" id="studio"><div className="section-head"><div><p className="kicker">The studio</p><h2>Four desks. <span>One moving picture.</span></h2></div><p className="intro">Not a toolbox. A creative floor where every department can see what the next one needs.</p></div><div className="grid">{desks.map(([number, label, title, copy, href]) => <article className="card" key={number}><p className="kicker">{number} · {label}</p><h3>{title}</h3><p>{copy}</p><Link className="text-link" href={href}>Explore this desk ↗</Link></article>)}</div></section>
    <section className="section" id="system"><div className="section-head"><div><p className="kicker">The handoff</p><h2>The system is <span>the creative.</span></h2></div><p className="intro">Every brief carries its context forward. No black box between the thought and the finished frame.</p></div><div className="flow">{[["01","Brief","Find the signal",""],["02","Build","Shape the world",""],["03","Cut","Move the frame","cyan"],["04","Release","Open the loop","lime"]].map(([n,title,copy,color]) => <div key={n}><span className={`dot ${color}`}></span><strong>{n} · {title}</strong><small>{copy}</small></div>)}</div><Link className="text-link" href="/system">See the full handoff system ↗</Link></section>
    <section className="section" id="social"><div className="panel"><p className="kicker">Signal room</p><h2>The afterlife of a good frame.</h2><p className="lede">Native cuts, conversation prompts, and audience signals become inputs for the next treatment, cut, or world.</p><div className="actions"><Link className="button button-outline" href="/social-workshop">Open the social workshop ↗</Link></div></div></section>
  </div>;
}
