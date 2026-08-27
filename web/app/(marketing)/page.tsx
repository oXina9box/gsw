import Link from "next/link";

import { HeroStage } from "@/components/marketing/hero-stage";
import { SignalBoard } from "@/components/marketing/signal-board";
import { GemBrandIcon } from "@/components/shell/gem-brand-icon";
import { createClient } from "@/lib/supabase/server";

const studioGroups = [
  { number: "01", className: "desk-marketing", label: "Front Office & strategy", title: "Find the angle.", copy: "Shape the brief, audience, channel, rights confirmation, schedule, run mode, and credit ceiling before work begins.", items: ["Research & marketing", "Channel strategy", "Approval planning"], href: "/studio" },
  { number: "02", className: "desk-creative", label: "Story & continuity", title: "Build a world that holds.", copy: "Develop story, storyboard, script, and screenplay while casting from your private, versioned Studio Universe.", items: ["Script & screenplay", "Private CDNA", "Storyboard continuity"], href: "/studio" },
  { number: "03", className: "desk-production", label: "AI & video production", title: "Move the frame.", copy: "Turn approved work into read-only GenPlay prompts, upload exact shot versions, and assemble selected media into finished masters.", items: ["Hybrid model routing", "Shot versioning", "Native assembly"], href: "/system" },
  { number: "04", className: "desk-social", label: "Launch & signals", title: "Keep it alive.", copy: "Plan platform-specific packages and return useful audience signals to the next brief. Direct posting stays gated until platform adapters are approved.", items: ["Release planning", "Manual signal capture", "Private signal loop"], href: "/social-workshop" },
] as const;

const flow = [
  ["01", "Brief", "Scope the signal", ""],
  ["02", "Build", "Story and continuity", "amber"],
  ["03", "Assemble", "Select and finish", "cyan"],
  ["04", "Release", "Plan and learn", "lime"],
] as const;

export default async function HomePage() {
  let authenticated = false;
  try { authenticated = Boolean((await (await createClient()).auth.getUser()).data.user); } catch { /* The public site also renders without local Supabase credentials. */ }
  const entryHref = authenticated ? "/app" : "/signup";

  return <div data-archetype="A1">
    <section className="hero shell">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-rule" /><span className="pulse-dot" /> Invite-only AI film studio · Beta credits included</p>
        <h1>Make the <span className="hero-emphasis">impossible</span> feel scheduled.</h1>
        <p className="hero-lede">Turn a brief into a structured production across 13 departments—with hired AI agents, human approvals, private continuity, and native assembly.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href={entryHref}>{authenticated ? "Open your Studio" : "Create your Studio"} ↗</Link>
          <Link className="button button-outline" href="#studio">Walk the floor</Link>
          <Link className="text-link" href="#system">See the handoff ↓</Link>
        </div>
        <div className="hero-footnote"><span>One Studio. Multiple channels.</span><span>01 — 13</span></div>
      </div>
      <HeroStage />
    </section>

    <div className="ticker" aria-hidden="true"><div className="ticker-track">
      {[0, 1].map((copy) => <span key={copy}>Research <b><GemBrandIcon /></b> Marketing <b><GemBrandIcon /></b> Creative <b><GemBrandIcon /></b> Story <b><GemBrandIcon /></b> Storyboard <b><GemBrandIcon /></b> Script <b><GemBrandIcon /></b> Screenplay <b><GemBrandIcon /></b> AI Conversion <b><GemBrandIcon /></b> Video Production <b><GemBrandIcon /></b> Launch <b><GemBrandIcon /></b> Social <b><GemBrandIcon /></b> Reporting <b><GemBrandIcon /></b></span>)}
    </div></div>

    <section className="studio-section shell reveal-on-scroll" id="studio">
      <div className="section-head"><h2>Thirteen departments. <span>One moving picture.</span></h2><p className="section-intro">A fixed production floor with configurable lanes, hired agents, explicit handoffs, and approvals that stay visible.</p></div>
      <div className="desk-grid">
        {studioGroups.map((group) => <article className={`desk-card ${group.className} reveal-on-scroll`} key={group.number}>
          <div className="desk-card-head"><span className="desk-number">{group.number}</span><span className="desk-signal" /></div>
          <p className="desk-label">{group.label}</p><h3>{group.title}</h3><p>{group.copy}</p>
          <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
          <Link className="card-arrow" href={group.href} aria-label={`Explore ${group.label}`}>↗</Link>
        </article>)}
      </div>
    </section>

    <section className="system-section shell reveal-on-scroll" id="system">
      <div className="section-head section-head-system"><h2>The system is <span>the creative.</span></h2><p className="section-intro">Manual, semi-automatic, or automatic runs move only within the approvals, provider limits, and credit cap you set.</p></div>
      <div className="flow-board"><div className="flow-line" aria-hidden="true" />{flow.map(([number, title, copy, tone]) => <div className="flow-step" key={number}><span className="flow-index">{number}</span><span className={`flow-dot ${tone ? `flow-dot-${tone}` : ""}`} /><div><strong>{title}</strong><small>{copy}</small></div></div>)}</div>
      <div className="quote-panel"><p>“Automation can move the work. <span>Human judgment decides what ships.</span>”</p><div><span className="quote-line" /> Gem Studio / operating principle</div></div>
    </section>

    <section className="social-section shell reveal-on-scroll" id="social">
      <div className="social-workbench">
        <div className="workbench-copy"><div className="workbench-orbit" aria-hidden="true">↗</div><h3>The afterlife of a good frame.</h3><p>Plan release variants and metadata, then save available performance and conversation as private signals for the next production.</p><Link className="button button-outline" href="/social-workshop">Explore the workshop ↗</Link></div>
        <SignalBoard />
      </div>
    </section>

    <section className="studio-section shell reveal-on-scroll" id="portfolio">
      <div className="section-head"><h2>See what the floor <span>can make.</span></h2><p className="section-intro">A living reel of scenes, systems, and release packages made with Gem Studio. Browse the work, then trace each frame back to its production contract.</p></div>
      <div className="desk-grid">
        <article className="desk-card desk-creative"><div className="desk-card-head"><span className="desk-number">REEL</span><span className="desk-signal" /></div><p className="desk-label">Portfolio</p><h3>Finished frames.</h3><p>Explore public work from creators using connected departments, private continuity, and human approvals.</p><Link className="button button-outline" href="/portfolio">Open the portfolio ↗</Link></article>
        <article className="desk-card desk-production"><div className="desk-card-head"><span className="desk-number">DNA</span><span className="desk-signal" /></div><p className="desk-label">Explore the system</p><h3>Follow the handoff.</h3><p>Read how a brief becomes a shot contract, a selected take, and a finished master without losing the thread.</p><Link className="button button-outline" href="/docs">Read the docs ↗</Link></article>
      </div>
    </section>

    <section className="closing-section shell reveal-on-scroll"><div className="closing-rule" /><div className="closing-layout"><h2>Bring the frame <span>before it exists.</span></h2><Link className="button button-primary" href={entryHref}>{authenticated ? "Open your Studio" : "Create your Studio"} ↗</Link></div></section>
  </div>;
}
