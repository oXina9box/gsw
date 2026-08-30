import { KometaC3Section, KometaC5Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, run productions, and manage Gem Studio.",
};

export default function DocsPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A2">
      {/* Section 1: [C3] 2-column spotlight navigation cards */}
      <KometaC3Section
        items={[
          {
            title: "Getting Started with Gem Studio",
            description: "Scaffold your first AI channel, configure universe identities, and launch an initial short.",
            href: "/docs/quickstart",
          },
          {
            title: "GenPlay Shot & Prompt Contracts",
            description: "Learn how to author and validate structured shot specs for multi-model generative video.",
            href: "/docs/genplay",
          },
          {
            title: "Continuity DNA (CDNA) Schema",
            description: "Deep dive into character, location, and prop continuity vaults with JSON-schema contracts.",
            href: "/docs/dna",
          },
          {
            title: "Encrypted BYOK Key Management",
            description: "Configure AES-256 encrypted provider keys for OpenAI, Anthropic, Replicate, and Midjourney.",
            href: "/docs/byok",
          },
        ]}
      />

      {/* Section 2: [C5] 4-card guide index */}
      <KometaC5Section
        badge="Core Manuals"
        title="Production Guides & Reference"
        lede="Everything you need to operate a high-volume autonomous film studio."
        cards={[
          {
            title: "13-Stage Pipeline Spec",
            description: "Full lifecycle reference from brief scoping and scriptwriting to final video delivery."
          },
          {
            title: "Departmental Handoffs",
            description: "Rules for passing typed artifacts between Story, Visuals, Audio, and Release lanes."
          },
          {
            title: "Self-Hosting & Docker",
            description: "Deploy the open-core stack locally or on dedicated cloud instances with full database privacy."
          },
          {
            title: "Security & RLS Policies",
            description: "Understand workspace isolation, credential vaults, and multi-tenant database protection."
          }
        ]}
        ctaHref="/pricing"
        ctaLabel="View Studio Plans & Licensing"
      />
    </article>
  );
}
