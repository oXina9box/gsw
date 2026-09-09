import Link from "next/link";
import { EntryActions } from "@/components/marketing/entry-actions";
import { HeroStage } from "@/components/marketing/hero-stage";
import { SignalBoard } from "@/components/marketing/signal-board";

export const metadata = {
  title: "Gem Studio — AI film studio",
  description:
    "Gem Studio brings the thinking, making, moving, and sharing of a film into one connected creative floor.",
};

const tickerLine = (
  <>
    Marketing <b>✦</b> Creative <b>✦</b> Production <b>✦</b> Social workshop <b>✦</b>
  </>
);

const desks = [
  {
    number: "01",
    label: "Marketing department",
    title: "Find the angle.",
    body: "Turn a loose brief into a point of view, a campaign shape, and a reason to keep watching.",
    items: ["Campaign direction", "Audience signals", "Launch planning"],
    href: "/system",
    arrowLabel: "See the system",
  },
  {
    number: "02",
    label: "Creative department",
    title: "Make it feel inevitable.",
    body: "Build the visual language, the world, and the strange little detail that makes a frame yours.",
    items: ["Concept development", "Storyboards & worlds", "Style systems"],
    href: "/system",
    arrowLabel: "See the system",
  },
  {
    number: "03",
    label: "Production department",
    title: "Move the frame.",
    body: "Generate, direct, refine, and finish the work without losing the original spark in the queue.",
    items: ["AI film production", "Editorial & finishing", "Version control"],
    href: "/system",
    arrowLabel: "See the system",
  },
  {
    number: "04",
    label: "Social workshop",
    title: "Keep it alive.",
    body: "Cut the story into a living conversation: native formats, quick tests, and signals fed back into the next frame.",
    items: ["Platform-native cuts", "Conversation prompts", "Signal feedback"],
    href: "/social-workshop",
    arrowLabel: "Open the social workshop",
  },
] as const;

const flowSteps = [
  { index: "01", dot: "", title: "Brief", caption: "Find the signal" },
  { index: "02", dot: "flow-dot-amber", title: "Build", caption: "Shape the world" },
  { index: "03", dot: "flow-dot-cyan", title: "Cut", caption: "Move the frame" },
  { index: "04", dot: "flow-dot-lime", title: "Release", caption: "Open the loop" },
] as const;

export default function HomePage() {
  return (
    <div data-archetype="A1">
      {/* Hero */}
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-rule" />
            <span className="pulse-dot" /> Online AI film studio · Open for briefs
          </p>
          <h1>
            Make the <span className="hero-emphasis">impossible</span> feel scheduled.
          </h1>
          <p className="hero-lede">
            Gem Studio brings the thinking, making, moving, and sharing of a film into one connected creative floor.
          </p>
          <EntryActions />
          <div className="hero-footnote">
            <span>Built for small teams with big frames.</span>
            <span>01 — 04</span>
          </div>
        </div>
        <HeroStage />
      </section>

      {/* Ticker */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>{tickerLine}</span>
          <span>{tickerLine}</span>
        </div>
      </div>

      {/* The studio */}
      <section className="studio-section shell" id="studio">
        <div className="section-head reveal-on-scroll">
          <div>
            <p className="section-kicker">The studio</p>
            <h2>
              Four desks. <span>One moving picture.</span>
            </h2>
          </div>
          <p className="section-intro">
            Not a toolbox. A creative floor where every department can see what the next one needs before the handoff.
          </p>
        </div>
        <div className="desk-grid">
          {desks.map((desk) => (
            <article className="desk-card reveal-on-scroll" key={desk.number}>
              <div className="desk-card-head">
                <span className="desk-number">{desk.number}</span>
                <span className="desk-signal" />
              </div>
              <p className="desk-label">{desk.label}</p>
              <h3>{desk.title}</h3>
              <p>{desk.body}</p>
              <ul>
                {desk.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="card-arrow" href={desk.href} aria-label={desk.arrowLabel}>
                ↗
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* The handoff */}
      <section className="system-section shell" id="system">
        <div className="section-head section-head-system reveal-on-scroll">
          <div>
            <p className="section-kicker">The handoff</p>
            <h2>
              The system is <span>the creative.</span>
            </h2>
          </div>
          <p className="section-intro">
            Every brief carries its context forward. No black box between the thought and the finished frame.
          </p>
        </div>
        <div className="flow-board reveal-on-scroll">
          <div className="flow-line" aria-hidden="true" />
          {flowSteps.map((step) => (
            <div className="flow-step" key={step.index}>
              <span className="flow-index">{step.index}</span>
              <span className={`flow-dot ${step.dot}`.trim()} />
              <div>
                <strong>{step.title}</strong>
                <small>{step.caption}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="quote-panel reveal-on-scroll">
          <p>
            “The handoff should feel less like a relay race and more like a <span>shared nervous system.</span>”
          </p>
          <div>
            <span className="quote-line" /> Gem Studio / principle 04
          </div>
        </div>
      </section>

      {/* Social workshop */}
      <section className="social-section shell" id="social">
        <div className="social-workbench reveal-on-scroll">
          <div className="workbench-copy">
            <div className="workbench-orbit">↗</div>
            <p className="eyebrow">
              <span className="eyebrow-rule" /> Signal room
            </p>
            <h3>The afterlife of a good frame.</h3>
            <p>
              A place to turn one piece of work into many points of entry—without sanding off what made it worth
              sharing.
            </p>
            <Link className="button button-outline" href="/social-workshop">
              Open signal board ↗
            </Link>
          </div>
          <SignalBoard />
        </div>
      </section>

      {/* Closing */}
      <section className="closing-section shell">
        <div className="closing-rule" />
        <div className="closing-layout reveal-on-scroll">
          <p className="section-kicker">Ready when the brief is strange.</p>
          <h2>
            Bring us the frame <span>before it exists.</span>
          </h2>
          <EntryActions />
        </div>
      </section>
    </div>
  );
}
