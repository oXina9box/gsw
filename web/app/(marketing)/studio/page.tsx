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
        badge="CREATIVE WORKSPACE"
        title="Build worlds worth seeing"
        description="Turn a spark into a connected story, then carry it through production."
        imageSrc="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        primaryCta={{ label: "Create Studio", href: "/?auth=signup" }}
        secondaryCta={{ label: "View System Architecture", href: "/system" }}
        headingLevel="h1"
      />

      {/* Section 2: [F2] 4-column studio department grid */}
      <KometaF2Section
        heading="From first spark to final frame"
        lede="A connected creative space for developing, building, directing, and finishing."
        cards={[
          {
            title: "Shape the story",
            description: "Shape scenes, beats, and character intention.",
            bullets: ["Develop characters and scenes", "Keep visual DNA connected", "Move from idea to production"],
            href: "/docs"
          },
          {
            title: "Build the world",
            description: "Keep locations, props, and visual DNA connected.",
            bullets: ["Plan the next step", "Shape the work", "Keep momentum"],
            href: "/docs"
          },
          {
            title: "Direct the feeling",
            description: "Explore composition, motion, light, and performance.",
            bullets: ["Start with intent", "Explore the idea", "Build the frame"],
            href: "/docs"
          },
          {
            title: "Finish the frame",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
            bullets: ["Cut for rhythm", "Shape sound and color", "Prepare the release"],
            href: "/docs"
          }
        ]}
      />

      {/* Section 3: [C1] 3 stacked production standards + 3-image asset collage */}
      <KometaC1Section
        badge="MAKE IT YOURS"
        badgeColor="lime"
        title="A studio for independent imagination"
        lede="Keep the creative process clear from idea through release."
        items={[
          {
            title: "Stay in the director's chair",
            description: "Move from an early idea to a focused next step."
          },
          {
            title: "Keep continuity",
            description: "Keep the creative process clear from idea through release."
          },
          {
            title: "Coordinate the work",
            description: "Make deliberate choices and keep the work connected."
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
