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
        badge="Cinematic Showcase"
        badgeColor="cyan"
        title="Episodic Slates Powered by Gem Studio"
        lede="Explore real productions assembled with Gem Studio's 13-stage pipeline, CDNA character continuity, and GenPlay camera contracts."
        items={[
          {
            title: "Cyberpunk Anthology: Neon Drift",
            description: "A 4-part episodic sci-fi series with 12 distinct characters rendered with locked DNA continuity across 96 minutes of 4K video."
          },
          {
            title: "Documentary: Echoes of the Deep",
            description: "Photorealistic nature storytelling generated with custom lighting and camera angle specifications."
          },
          {
            title: "Animated Feature: Clockwork Kingdom",
            description: "Stylized 3D anime aesthetics rendered across continuous sequence binders without model drift."
          }
        ]}
        images={{
          hero: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small1: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small2: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          alt: "Portfolio showcase clips"
        }}
      />

      {/* Section 2: [C4] Featured film showcase banner */}
      <KometaC4Section
        badge="Flagship Release"
        title="Direct Your Next Project with Gem Studio"
        description="Every project in our portfolio was directed by solo creators utilizing deterministic agent handoffs and locked DNA continuity."
        imageSrc="https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
        primaryCta={{ label: "Launch a Studio Production", href: "/?auth=signup" }}
        secondaryCta={{ label: "Explore the Pipeline", href: "/system" }}
      />
    </article>
  );
}
