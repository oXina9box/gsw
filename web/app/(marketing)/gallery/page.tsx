import { KometaC1Section, KometaC4Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Gallery",
  description: "Visual assets, character anchors, and render reels from Gem Studio.",
};

export default function GalleryPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      <KometaC1Section
        badge="Asset Gallery"
        badgeColor="pink"
        title="Visual Assets & Universe Continuities"
        lede="Inspect high-fidelity render passes, location anchors, and lighting benchmarks generated with Gem Studio."
        items={[
          {
            title: "Character DNA Benchmarks",
            description: "High-resolution multi-angle character studies with locked bone structure and material fidelity."
          },
          {
            title: "Lighting & Volumetric Sets",
            description: "Cinematic anamorphic framing, rim lighting, and atmospheric volumetric fog setups."
          },
          {
            title: "Costume & Wardrobe Binders",
            description: "Persistent textile rendering, prop details, and equipment continuity across changing lighting conditions."
          }
        ]}
        images={{
          hero: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small1: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          small2: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          alt: "Gallery render passes"
        }}
      />

      <KometaC4Section
        badge="Production Floor Access"
        title="Start Generating High-Continuity Assets"
        description="Scaffold your private universe, seed characters with CDNA, and produce episodic video in your own isolated studio workspace."
        imageSrc="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        primaryCta={{ label: "Create Studio", href: "/?auth=signup" }}
        secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      />
    </article>
  );
}
