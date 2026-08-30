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
        title="Multi-Channel Automated Distribution"
        lede="Turn full-length studio productions into aspect-ratio optimized vertical shorts, teasers, and trailers across six major platforms."
        items={[
          { label: "YouTube Shorts" },
          { label: "TikTok Video" },
          { label: "Instagram Reels" },
          { label: "X / Twitter" },
          { label: "Discord Drops" },
          { label: "LinkedIn Video" },
        ]}
        ctaHref="/docs"
        ctaLabel="Learn About Channel Distribution"
      />

      {/* Section 2: [C3] 2-column channel workflow cards */}
      <KometaC3Section
        items={[
          {
            title: "Automated Vertical Re-Framing (9:16)",
            description: "Smart subject tracking keeps characters centered and subtitles dynamically positioned for mobile social feeds.",
            href: "/docs",
          },
          {
            title: "Multi-Variant Teaser Generation",
            description: "Generate 5 distinct hook variations from one production cut to test thumbnail and retention performance.",
            href: "/docs",
          },
        ]}
      />
    </article>
  );
}
