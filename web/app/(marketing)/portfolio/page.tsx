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
        badge="THE WORK"
        badgeColor="cyan"
        title="Stories in progress"
        lede="A look at stories and worlds Gem Studio helps you develop."
        items={[
          {
            title: "Concepts, frames, and finished direction",
            description: "Bring early ideas into a clear creative direction."
          },
          {
            title: "Find the visual thread",
            description: "Keep character, location, and scene choices connected."
          },
          {
            title: "Prepare the final frame",
            description: "Shape rhythm, sound, color, and the release package."
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
        badge="YOUR TURN"
        title="Build the work only you can make"
        description="Build a creative process that keeps your vision in view."
        imageSrc="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
        primaryCta={{ label: "Launch a Studio Production", href: "/?auth=signup" }}
        secondaryCta={{ label: "Explore the Pipeline", href: "/system" }}
      />
    </article>
  );
}
