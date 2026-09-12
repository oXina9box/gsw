import { KometaF1Section, KometaC3Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Social Workshop",
  description: "Automate social cutdowns, teaser clips, and episodic marketing with Gem Studio.",
};

export default function SocialWorkshopPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [F1] 6-channel distribution targets */}
      <KometaF1Section
        title="Turn finished work into a conversation"
        lede="Keep the creative process clear from idea through release."
        items={[
          { label: "Package" },
          { label: "Caption" },
          { label: "Schedule" },
          { label: "Share" },
          { label: "Learn" },
          { label: "Repeat" },
        ]}
        ctaHref="/docs"
        ctaLabel="Learn About Channel Distribution"
        headingLevel="h1"
      />

      {/* Section 2: [C3] 2-column channel workflow cards */}
      <KometaC3Section
        items={[
          {
            title: "A workshop for the next release",
            description: "Move from an early idea to a focused next step.",
            href: "/docs",
          },
          {
            title: "Keep continuity",
            description: "Keep the creative process clear from idea through release.",
            href: "/docs",
          },
        ]}
      />
    </article>
  );
}
