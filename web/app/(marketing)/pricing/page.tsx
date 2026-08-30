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
            Predictable studio tiers. <span className="text-amber">Zero per-seat penalties.</span>
          </span>
        }
        lede="Pay for pipeline throughput, not headcount. Solo creators and full production teams scale freely on cloud and BYOK options."
        pill1={{
          title: "Pro Cloud ($49/mo)",
          description: "All-inclusive managed credits, automated model routing, and cloud video rendering without managing keys."
        }}
        pill2={{
          title: "BYOK Dedicated ($29/mo)",
          description: "Bring your own OpenAI, Anthropic, and Replicate API keys. Pay pure wholesale inference costs."
        }}
        imageSrc="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Pricing Models"
        highlightColor="amber"
      />

      {/* Section 2: [C3] Spotlight Comparison Cards */}
      <KometaC3Section
        items={[
          {
            title: "Pro Cloud Subscription",
            description: "Direct access to all 13 departments with managed GPU rendering credits, automatic storage backups, and instant workspace provisioning.",
            href: "/?auth=signup&plan=pro-monthly",
          },
          {
            title: "BYOK Autonomous Stack",
            description: "Plug in your existing API credentials with AES-256 vault encryption. Unlimited team collaborators and zero pipeline markup.",
            href: "/?auth=signup&plan=byok-monthly",
          },
        ]}
      />

      {/* Section 3: [S1] 3-step checkout & provisioning flow */}
      <KometaStepSection
        badge="Instant Provisioning"
        title="Three Steps to Directing Your AI Slate"
        lede="Get your studio online in minutes with complete workspace isolation."
        steps={[
          {
            step: "01",
            title: "Choose Your Tier",
            description: "Select Pro Cloud for managed credits or BYOK for direct wholesale inference pricing.",
            href: "/?auth=signup",
            linkLabel: "Select Plan →",
          },
          {
            step: "02",
            title: "Connect Studio Universe",
            description: "Scaffold your primary channel, seed your lead character DNA, and define departmental roles.",
            href: "/studio",
            linkLabel: "Learn About DNA →",
          },
          {
            step: "03",
            title: "Render First Production",
            description: "Draft your pilot script, validate GenPlay shot contracts, and generate your first cinematic release.",
            href: "/system",
            linkLabel: "View System Details →",
          },
        ]}
      />
    </article>
  );
}
