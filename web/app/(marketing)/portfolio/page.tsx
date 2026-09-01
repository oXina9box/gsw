import { KometaC1Section, KometaC4Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Portfolio",
  description: "Public creations and showcases produced with Gem Studio.",
};

export default function PortfolioPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [C1] Showcase lede + 3 capability highlights + 3-image production showcase */}
      <KometaC1Section
        badge="Lorem ipsum"
        badgeColor="cyan"
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
          alt: "Portfolio showcase clips"
        }}
        headingLevel="h1"
      />

      {/* Section 2: [C4] Featured film showcase banner */}
      <KometaC4Section
        badge="Lorem ipsum"
        title="Lorem ipsum dolor sit amet consectetur"
        description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
        imageSrc="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
        primaryCta={{ label: "Launch a Studio Production", href: "/?auth=signup" }}
        secondaryCta={{ label: "Explore the Pipeline", href: "/system" }}
      />
    </article>
  );
}
