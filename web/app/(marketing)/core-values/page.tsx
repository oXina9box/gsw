import { KometaC2Section, KometaF2Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Core Values",
  description: "The core principles and architectural philosophy behind Gem Studio.",
};

export default function CoreValuesPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [C2] Manifesto heading + lede + 2 mission pills + studio photo */}
      <KometaC2Section
        title={
          <span>
            Cinema needs craft. <span className="text-lime">Not random slop.</span>
          </span>
        }
        lede="We believe generative video only becomes art when directors have absolute, deterministic control over continuity, framing, tone, and pacing."
        pill1={{
          title: "Creator First & Always",
          description: "No mandatory subscriptions or hidden lock-ins. You own 100% of your generated media and character DNA."
        }}
        pill2={{
          title: "Open Core Standards",
          description: "We build on open schemas, verifiable JSON shot contracts, and transparent background worker pipelines."
        }}
        imageSrc="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Principles"
        highlightColor="lime"
      />

      {/* Section 2: [F2] 4 core studio principles */}
      <KometaF2Section
        heading="Four Non-Negotiable Invariants"
        lede="Every line of code and every agent contract in Gem Studio adheres to four foundational rules."
        cards={[
          {
            title: "Continuity First",
            description: "No scene generation proceeds without strict character and environment identity verification.",
            bullets: ["Zero character morphing", "Persistent lighting vectors", "Location boundary locks"],
            href: "/studio"
          },
          {
            title: "Human Director in the Loop",
            description: "AI agents suggest and draft; human creators decide, approve, and finalize.",
            bullets: ["Configurable approval gates", "Pre-render cost inspection", "Instant run pauses"],
            href: "/system"
          },
          {
            title: "Zero Vendor Lock-In",
            description: "Switch seamlessly between OpenAI, Anthropic, Replicate, and local open-weights models.",
            bullets: ["Encrypted AES-256 BYOK", "Open-source contracts", "Direct model routing"],
            href: "/docs"
          },
          {
            title: "Deterministic Reproducibility",
            description: "Every generated shot is backed by an immutable ledger of prompts, seeds, and model revisions.",
            bullets: ["Audit trail per frame", "Versioned DNA records", "One-click regeneration"],
            href: "/pricing"
          }
        ]}
      />
    </article>
  );
}
