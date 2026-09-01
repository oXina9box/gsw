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
        ctaLabel="Learn About Channel Distribution"
        headingLevel="h1"
      />

      {/* Section 2: [C3] 2-column channel workflow cards */}
      <KometaC3Section
        items={[
          {
            title: "Lorem ipsum dolor sit",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            href: "/docs",
          },
          {
            title: "Consectetur adipiscing elit",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            href: "/docs",
          },
        ]}
      />
    </article>
  );
}
