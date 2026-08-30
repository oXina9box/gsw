import { KometaF1Section, KometaC5Section } from "@/components/blocks/kometa/kometa-approved-sections";
import { FlowbiteCtaSection } from "@/components/blocks/flowbite/flowbite-cta";

export const metadata = {
  title: "The System",
  description:
    "See how Gem Studio moves a brief through approvals, GenPlay, shot uploads, MP4 assembly, and release planning.",
};

export default function SystemPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [F1] 6-node system architecture grid */}
      <KometaF1Section
        title="Six Foundational System Layers"
        lede="Gem Studio operates as a stateful, DB-driven orchestration engine connecting model providers, storage buckets, continuity vaults, and worker queues."
        items={[
          { label: "GenPlay Contracts" },
          { label: "Continuity DNA" },
          { label: "Worker Engine" },
          { label: "Encrypted BYOK" },
          { label: "Row-Level Security" },
          { label: "Media Storage" },
        ]}
        ctaHref="/docs"
        ctaLabel="Read System Architecture Specs"
      />

      {/* Section 2: [C5] 4-card system breakdown */}
      <KometaC5Section
        badge="System Core"
        title="Predictable Machine Guarantees"
        lede="Designed for solo creators needing high uptime, cost caps, and reproducible media generation."
        cards={[
          {
            title: "Continuity DNA Vaults",
            description: "JSON schema validated records ensure facial landmarks, costume vectors, and location bounds persist across runs."
          },
          {
            title: "AES-256 Secret BYOK",
            description: "Provider credentials are authenticated at worker boundaries and never leak to client JavaScript."
          },
          {
            title: "Deterministic Workers",
            description: "Background worker queues execute async generations with automatic retry caps and quota reservations."
          },
          {
            title: "Immutable Audit Ledger",
            description: "Every prompt, model attempt, seed, and generated asset is permanently linked to its parent production."
          }
        ]}
        ctaHref="/pricing"
        ctaLabel="View Studio Deployment Tiers"
      />

      {/* Section 3: [CTA1] Split dashboard mockup CTA */}
      <FlowbiteCtaSection
        title="Engineered for mission-critical generative cinema"
        description="Deploy Gem Studio in the cloud with our Pro plans or self-host the open-core stack on your own infrastructure."
        ctaHref="/?auth=signup"
        ctaLabel="Launch Your System"
      />
    </article>
  );
}
