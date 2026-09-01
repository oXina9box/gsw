import { KometaC2Section, KometaC3Section, KometaStepSection } from "@/components/blocks/kometa/kometa-approved-sections";

export const metadata = {
  title: "Pricing & Editions",
  description: "Choose a Gem Studio plan for your production slate: Pro, BYOK, or Self-Host.",
};

export default function PricingPage() {
  return (
    <article className="marketing-detail space-y-12 sm:space-y-16" data-archetype="A1">
      {/* Section 1: [C2] Pricing model overview */}
      <KometaC2Section
        title={
          <span>
            Lorem ipsum dolor <span className="text-amber">sit amet.</span>
          </span>
        }
        lede="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        pill1={{
          title: "Pro Cloud ($49/mo)",
          description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo."
        }}
        pill2={{
          title: "BYOK Dedicated ($29/mo)",
          description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla."
        }}
        imageSrc="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Pricing Models"
        highlightColor="amber"
        headingLevel="h1"
      />
      {/* Section 2: [C3] Spotlight Comparison Cards */}
      <KometaC3Section
        items={[
          {
            title: "Pro Cloud Subscription",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            href: "/?auth=signup&plan=pro-monthly",
          },
          {
            title: "BYOK Autonomous Stack",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            href: "/?auth=signup&plan=byok-monthly",
          },
        ]}
      />

      {/* Section 3: [S1] 3-step checkout & provisioning flow */}
      <KometaStepSection
        badge="Lorem ipsum"
        title="Lorem ipsum dolor sit amet consectetur"
        lede="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        steps={[
          {
            step: "01",
            title: "Lorem ipsum dolor",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
            href: "/?auth=signup",
            linkLabel: "Select Plan →",
          },
          {
            step: "02",
            title: "Consectetur adipiscing",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.",
            href: "/studio",
            linkLabel: "Learn more →",
          },
          {
            step: "03",
            title: "Sed do eiusmod",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
            href: "/system",
            linkLabel: "Learn more →",
          },
        ]}
      />
    </article>
  );
}
