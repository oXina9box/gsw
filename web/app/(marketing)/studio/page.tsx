import { KometaC4Section, KometaF2Section, KometaC1Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "The Studio",
  description:
    "A private AI film studio with channels, 13 connected departments, hired agents, continuity records, and human approvals.",
};

export default function StudioPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [C4] 50/50 split diagonal image hero */}
      <KometaC4Section
        badge="Lorem ipsum dolor"
        title="Lorem ipsum dolor sit amet consectetur"
        description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
        imageSrc="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        primaryCta={{ label: "Create Studio", href: "/?auth=signup" }}
        secondaryCta={{ label: "View System Architecture", href: "/system" }}
        headingLevel="h1"
      />

      {/* Section 2: [F2] 4-column studio department grid */}
      <KometaF2Section
        heading="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        cards={[
          {
            title: "Lorem ipsum",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
            bullets: ["Lorem ipsum dolor", "Consectetur adipiscing", "Sed do eiusmod"],
            href: "/docs"
          },
          {
            title: "Dolor sit amet",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
            bullets: ["Tempor incididunt", "Ut labore et dolore", "Magna aliqua ut"],
            href: "/docs"
          },
          {
            title: "Consectetur",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
            bullets: ["Enim ad minim", "Quis nostrud exercitation", "Ullamco laboris nisi"],
            href: "/docs"
          },
          {
            title: "Adipiscing elit",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
            bullets: ["Aliquip ex ea", "Commodo consequat", "Duis aute irure"],
            href: "/docs"
          }
        ]}
      />

      {/* Section 3: [C1] 3 stacked production standards + 3-image asset collage */}
      <KometaC1Section
        badge="Lorem ipsum"
        badgeColor="lime"
        title="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        items={[
          {
            title: "Lorem ipsum dolor",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
          },
          {
            title: "Consectetur adipiscing",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
          },
          {
            title: "Sed do eiusmod",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim."
          }
        ]}
        images={{
          hero: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small1: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small2: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          alt: "Production studio workflow"
        }}
      />
    </article>
  );
}
