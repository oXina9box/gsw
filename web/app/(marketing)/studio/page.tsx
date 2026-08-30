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
        badge="Autonomous Production Floor"
        title="Your Private AI Production Studio"
        description="A full-spectrum studio built for solo directors: versioned character DNA, typed shot contracts, multi-agent department lanes, and human approval gates on every key cut."
        imageSrc="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        primaryCta={{ label: "Create Studio", href: "/?auth=signup" }}
        secondaryCta={{ label: "View System Architecture", href: "/system" }}
      />

      {/* Section 2: [F2] 4-column studio department grid */}
      <KometaF2Section
        heading="Four Specialized Departments"
        lede="Gem Studio organizes generative filmmaking into distinct departmental lanes. Each lane executes with isolated agent scopes and typed artifact handoffs."
        cards={[
          {
            title: "Script & Story",
            description: "Narrative drafting, scene beats, and screenplay formatting aligned to character voice models.",
            bullets: ["Screenplay parser", "Scene breakdown", "Voice model contracts"],
            href: "/docs"
          },
          {
            title: "Visual & DNA",
            description: "Studio Universe continuity locks for characters, wardrobe, props, and location sets.",
            bullets: ["Character DNA locks", "Location anchors", "Style embeddings"],
            href: "/docs"
          },
          {
            title: "Production Floor",
            description: "GenPlay camera direction, lighting setups, actor positioning, and generative render queues.",
            bullets: ["GenPlay shot contracts", "Multi-model workers", "Attempt audit ledger"],
            href: "/docs"
          },
          {
            title: "Release Planning",
            description: "Native assembly, stem rendering, metadata generation, and scheduled multi-channel distribution.",
            bullets: ["Timeline assembly", "Channel profiles", "Automated release packs"],
            href: "/docs"
          }
        ]}
      />

      {/* Section 3: [C1] 3 stacked production standards + 3-image asset collage */}
      <KometaC1Section
        badge="Enterprise Guardrails"
        badgeColor="lime"
        title="Predictable Cinematic Guardrails"
        lede="No random slop. Every step in your studio operates under strict invariants to keep continuity, costs, and rights under absolute control."
        items={[
          {
            title: "Zero Continuity Drift",
            description: "Characters keep identical bone structures, facial features, and styling across months of episodic production."
          },
          {
            title: "Deterministic Secret BYOK",
            description: "Your provider keys are encrypted with AES-256-GCM. Keys never reach browser bundles or shared agent logs."
          },
          {
            title: "Human Director Approvals",
            description: "Set approval thresholds per department. Automated passes pause before expensive render runs until you sign off."
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
