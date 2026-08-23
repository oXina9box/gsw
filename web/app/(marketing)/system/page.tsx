import Link from "next/link";

import { EntryActions } from "@/components/marketing/entry-actions";

export const metadata = { title: "The System", description: "See how Gem Studio moves a brief through approvals, GenPlay, shot uploads, MP4 assembly, and release planning." };

const steps = [
  ["01", "Brief & strategy", "Define the channel, audience, intent, constraints, rights, schedule, run mode, and maximum spend."],
  ["02", "Story & continuity", "Develop story through screenplay, cast from the private Universe, and preserve approved character, location, and prop references."],
  ["03", "GenPlay & shots", "Create a read-only generation prompt for each shot. Copy it to the video tool you choose, then upload each version against the exact shot."],
  ["04", "Assembly & release", "Select one compatible MP4 per shot, assemble them into a master, then plan the release and record its useful signals."],
] as const;

export default function SystemPage() {
  return <article className="marketing-detail">
    <header className="detail-hero shell"><h1>The system is <span>the creative.</span></h1><p className="detail-lede">Gem Studio turns production into a visible sequence of decisions. Agents can keep work moving; users keep control of approvals, providers, credits, and release.</p><EntryActions /></header>
    <section className="process-list shell">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}</section>
    <section className="run-mode-panel shell"><div><h2>Choose where the system waits.</h2></div><div className="run-mode-list"><p><strong>Manual</strong><span>You start each next step.</span></p><p><strong>Semi-auto</strong><span>The workflow runs until a configured gate.</span></p><p><strong>Auto</strong><span>The workflow continues within policy, provider, and credit limits.</span></p></div></section>
    <section className="detail-grid shell">
      <article><h2>Use the model that fits the role.</h2><p>Official adapters and OpenAI-compatible endpoints can route compatible text, image, and audio work across free, mid, and quality tiers. Your credentials remain server-side and masked.</p></article>
      <article><h2>GenPlay stays readable.</h2><p>Version one does not pretend every video provider has the same API. Copy the approved prompt, generate externally, and upload versions to the exact GenPlay shot.</p></article>
      <article><h2>Selections become a master.</h2><p>Once every required shot has a selected compatible MP4, the assembly worker joins those clips into one private master while preserving shot versions.</p></article>
      <article><h2>Spend is bounded before work starts.</h2><p>The visible fixed job price is reserved before provider work and released after failure or cancellation. A balance never silently drops below zero.</p></article>
    </section>
    <section className="detail-cta shell"><h2>A release is the start of the next signal.</h2><Link className="button button-outline" href="/social-workshop">Explore the social workshop ↗</Link></section>
  </article>;
}
