import Link from "next/link";
import { DEPARTMENTS } from "@/lib/studio/domain";
import { EntryActions } from "@/components/marketing/entry-actions";

export const metadata = { title: "The Studio", description: "A private AI film studio with channels, 13 connected departments, hired agents, continuity records, and human approvals." };

export default function StudioPage() {
  return <article className="marketing-detail">
    <header className="detail-hero shell"><h1>Thirteen departments. <span>One moving picture.</span></h1><p className="detail-lede">Gem Studio gives one creator one private Studio: recurring channels, configurable lanes, hired AI agents, production history, and the context each handoff needs.</p><EntryActions secondaryHref="/login" /></header>
    <section className="detail-band shell"><div><h2>A brief becomes an operating plan.</h2></div><p>Choose the channel, audience, goal, rights confirmation, schedule, credit cap, run mode, and quality preference before a production moves. Manual, semi-automatic, and automatic runs share the same visible approval history.</p></section>
    <section className="department-rail shell" aria-label="Studio departments">{DEPARTMENTS.map((department, index) => <div className="department-rail-item" key={department}><span>{String(index + 1).padStart(2, "0")}</span><strong>{department}</strong></div>)}</section>
    <section className="detail-grid shell">
      <article><h2>People shape the lanes.</h2><p>Install official agents, import private ones, or edit the six-file contract for free and custom agents. Premium configurations run securely without exposing their private files in the browser.</p></article>
      <article><h2>Your Universe remembers.</h2><p>Casting can reuse versioned character DNA from your Studio Universe. Location and prop continuity follow the same private boundary as they enter production.</p></article>
      <article><h2>One brand, many outlets.</h2><p>Each channel holds its audience, voice, cadence, content pillars, destinations, and productions without creating a second workspace or leaking records across users.</p></article>
      <article><h2>Automation never hides the decision.</h2><p>Pause or resume a production, change its run mode, inspect job attempts and credit reservations, and choose the exact artifact that becomes the next handoff.</p></article>
    </section>
    <section className="detail-cta shell"><h2>The floor is only useful when the handoffs hold.</h2><Link className="button button-outline" href="/system">Explore the system ↗</Link></section>
  </article>;
}
