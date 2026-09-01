import { KometaC3Section, KometaC5Section } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Documentation",
  description: "Learn how to configure channels, run productions, and manage Gem Studio.",
};

export default function DocsPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A2">
      <header className="max-w-xl mx-auto text-center pt-6 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-lime/30 text-lime bg-lime/10">
          Lorem ipsum
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
          Lorem ipsum dolor sit amet
        </h1>
        <p className="text-base text-text-muted font-body mt-4">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
        </p>
      </header>

      {/* Section 1: [C3] 2-column spotlight navigation cards */}
      <KometaC3Section
        items={[
          {
            title: "Lorem Ipsum Quickstart",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
            href: "/docs/quickstart",
          },
          {
            title: "Consectetur GenPlay",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
            href: "/docs/genplay",
          },
          {
            title: "Sed do Eiusmod DNA",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
            href: "/docs/dna",
          },
          {
            title: "Tempor Incididunt BYOK",
            description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.",
            href: "/docs/byok",
          },
        ]}
      />
      {/* Section 2: [C5] 4-card guide index */}
      <KometaC5Section
        badge="Lorem ipsum"
        title="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        cards={[
          {
            title: "Lorem ipsum dolor",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea."
          },
          {
            title: "Consectetur adipiscing",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat."
          },
          {
            title: "Sed do eiusmod",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt."
          },
          {
            title: "Tempor incididunt",
            description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
          }
        ]}
        ctaHref="/pricing"
        ctaLabel="View Studio Plans & Licensing"
      />
    </article>
  );
}
