import { KometaC1Section, KometaC4Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Gallery",
  description: "Visual assets, character anchors, and render reels from Gem Studio.",
};

export default function GalleryPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      <KometaC1Section
        badge="CONCEPT GALLERY"
        badgeColor="pink"
        title="A place for impossible ideas"
        lede="Keep the creative process clear from idea through release."
        items={[
          {
            title: "Explore visual directions",
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
          alt: "Gallery render passes"
        }}
        headingLevel="h1"
      />

      <KometaC4Section
        badge="OPEN THE DOOR"
        title="Give your next world somewhere to exist"
        description="Keep the creative process clear from idea through release."
        imageSrc="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        primaryCta={{ label: "Create Studio", href: "/?auth=signup" }}
        secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      />
    </article>
  );
}
