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
        title="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        items={[
          { label: "Lorem ipsum" },
          { label: "Dolor sit" },
          { label: "Consectetur" },
          { label: "Adipiscing" },
          { label: "Sed eiusmod" },
          { label: "Tempor inc" },
        ]}
        ctaHref="/docs"
        ctaLabel="Read System Architecture Specs"
        headingLevel="h1"
      />

      {/* Section 2: [C5] 4-card system breakdown */}
      <KometaC5Section
        badge="Lorem ipsum"
        title="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        cards={[
          {
            title: "Lorem ipsum dolor",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
          },
          {
            title: "Consectetur adipiscing",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla."
          },
          {
            title: "Sed do eiusmod",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit."
          },
          {
            title: "Tempor incididunt",
            description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur."
          }
        ]}
        ctaHref="/pricing"
        ctaLabel="View Studio Deployment Tiers"
      />

      {/* Section 3: [CTA1] Split statement CTA */}
      <FlowbiteCtaSection
        title="Lorem ipsum dolor sit amet consectetur"
        description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        ctaHref="/?auth=signup"
        ctaLabel="Launch Your System"
      />
    </article>
  );
}
