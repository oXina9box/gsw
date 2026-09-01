import { notFound } from "next/navigation";
import { KometaC2Section, KometaF2Section } from "@/components/blocks/kometa/kometa-approved-sections";
export const metadata = {
  title: "Core Values",
  description: "The core principles and architectural philosophy behind Gem Studio.",
};
export const dynamic = "force-dynamic";

export default function CoreValuesPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") {
    notFound();
  }

  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [C2] Manifesto heading + lede + 2 mission pills + studio photo */}
      <KometaC2Section
        title={
          <span>
            Lorem ipsum dolor <span className="text-lime">sit amet.</span>
          </span>
        }
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
        pill1={{
          title: "Lorem ipsum dolor",
          description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
        }}
        pill2={{
          title: "Consectetur adipiscing",
          description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla."
        }}
        imageSrc="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Principles"
        highlightColor="lime"
      />

      {/* Section 2: [F2] 4 core studio principles */}
      <KometaF2Section
        heading="Lorem ipsum dolor sit amet"
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        cards={[
          {
            title: "Lorem ipsum",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
            bullets: ["Lorem ipsum dolor", "Consectetur adipiscing", "Sed do eiusmod"],
            href: "/studio"
          },
          {
            title: "Dolor sit amet",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
            bullets: ["Tempor incididunt", "Ut labore et dolore", "Magna aliqua ut"],
            href: "/system"
          },
          {
            title: "Consectetur",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
            bullets: ["Enim ad minim", "Quis nostrud exercitation", "Ullamco laboris nisi"],
            href: "/docs"
          },
          {
            title: "Adipiscing elit",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.",
            bullets: ["Aliquip ex ea", "Commodo consequat", "Duis aute irure"],
            href: "/pricing"
          }
        ]}
      />
    </article>
  );
}
