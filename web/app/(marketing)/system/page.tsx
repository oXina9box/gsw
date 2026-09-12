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
        title="A connected system for making films"
        lede="Keep the creative process clear from idea through release."
        items={[
          { label: "Develop" },
          { label: "Build" },
          { label: "Direct" },
          { label: "Finish" },
          { label: "Continuity" },
          { label: "Release" },
        ]}
        ctaHref="/docs"
        ctaLabel="Read System Architecture Specs"
        headingLevel="h1"
      />

      {/* Section 2: [C5] 4-card system breakdown */}
      <KometaC5Section
        badge="THE PIPELINE"
        title="Every stage, in one creative space"
        lede="Keep the creative process clear from idea through release."
        cards={[
          {
            title: "Keep the work moving",
            description: "Move from an early idea to a focused next step."
          },
          {
            title: "Keep continuity",
            description: "Keep the creative process clear from idea through release. eu fugiat nulla."
          },
          {
            title: "Coordinate the work",
            description: "Make deliberate choices and keep the work connected."
          },
          {
            title: "Release with intent",
            description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur."
          }
        ]}
        ctaHref="/pricing"
        ctaLabel="View Studio Deployment Tiers"
      />

      {/* Section 3: [CTA1] Split statement CTA */}
      <FlowbiteCtaSection
        title="Your process, clearly connected"
        description="Keep the creative process clear from idea through release."
        ctaHref="/?auth=signup"
        ctaLabel="Launch Your System"
      />
    </article>
  );
}
