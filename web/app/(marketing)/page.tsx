import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KometaC2Section, KometaStepSection } from "@/components/blocks/kometa/kometa-approved-sections";
import { PrelineVerticalMarquee } from "@/components/blocks/preline/preline-vertical-marquee";
import { FlowbiteCtaSection } from "@/components/blocks/flowbite/flowbite-cta";
import { HeroStage } from "@/components/marketing/hero-stage";

export default async function HomePage() {
  let authenticated = false;
  try {
    authenticated = Boolean((await (await createClient()).auth.getUser()).data.user);
  } catch {
    /* The public site also renders without local Supabase credentials. */
  }
  const entryHref = authenticated ? "/app" : "/?auth=signup";

  return (
    <div data-archetype="A1" className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="hero pt-6 pb-12 sm:py-16">
        <div className="hero-copy">
          <div className="eyebrow flex items-center gap-3">
            <span className="eyebrow-rule" />
            <span className="pulse-dot" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan">A private AI film studio</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-text leading-tight tracking-tight">
            Make the impossible feel <span className="text-pink">scheduled.</span>
          </h1>

          <p className="hero-lede text-lg sm:text-xl text-text-muted font-body leading-relaxed max-w-xl mt-4">
            Gem Studio is a solo-creator AI film studio: channels, hired agents, human-approved production, native assembly, and continuous universe continuity.
          </p>

          <div className="hero-actions flex flex-wrap items-center gap-4 mt-8">
            <Link className="button button-primary bg-pink hover:bg-pink/90 text-ink font-mono font-semibold px-6 py-3 rounded-full shadow-lg" href={entryHref}>
              {authenticated ? "Open workspace" : "Create studio"}
            </Link>
            <Link className="button button-outline border-border text-text hover:border-cyan hover:text-cyan font-mono font-medium px-5 py-3 rounded-full" href="/studio">
              Explore the studio
            </Link>
          </div>
        </div>

        <div className="hero-stage mt-8 lg:mt-0">
          <HeroStage />
        </div>
      </section>

      {/* Section 2: [C2] 2-column feature highlight */}
      <KometaC2Section
        title={
          <span>
            Autonomous departments. <span className="text-cyan">Absolute creator control.</span>
          </span>
        }
        lede="Gem Studio structures AI video production into four specialized departments: Front Office, Story & Continuity, Production Floor, and Sound & Release. Every stage produces strict, typed shot contracts."
        pill1={{
          title: "Continuity DNA (CDNA)",
          description: "Persistent character faces, location anchors, and lighting styles locked across thousands of generated cuts."
        }}
        pill2={{
          title: "BYOK & Open Core",
          description: "Bring your own API keys for OpenAI, Anthropic, Replicate, and Midjourney with zero vendor lock-in."
        }}
        imageSrc="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Production Engine"
        highlightColor="cyan"
      />

      {/* Section 3: [S1] 3-step production pipeline */}
      <KometaStepSection
        badge="Autonomous 13-Stage Workflow"
        title="From first brief to final assembly in 3 clear milestones"
        lede="No fragmented prompt windows. Run your entire production through a deterministic engine built specifically for cinema."
        steps={[
          {
            step: "01",
            title: "Brief & Universe Lock",
            description: "Define characters, style guides, and department lanes with strict DNA continuity safeguards.",
            href: "/studio",
            linkLabel: "Explore Studio Floor →"
          },
          {
            step: "02",
            title: "GenPlay Shot Generation",
            description: "Hired AI agents draft, critique, and render shots against exact lens, lighting, and action contracts.",
            href: "/system",
            linkLabel: "View System Architecture →"
          },
          {
            step: "03",
            title: "Assembly & Multi-Channel Release",
            description: "Review automated edit cuts, sound design stems, and release packages ready for YouTube and social networks.",
            href: "/pricing",
            linkLabel: "View Pricing Plans →"
          }
        ]}
      />

      {/* Section 4: [VM] Vertical dual testimonial marquee */}
      <PrelineVerticalMarquee
        title="Real signals from creators shipping with Gem Studio"
        subtitle="Independent filmmakers, solo studios, and agency directors scaling cinematic output without sacrificing quality."
        column1={[
          {
            name: "Marcus Vance",
            handle: "@marcus_film",
            text: "The DNA continuity system finally made it possible to keep our lead character consistent across 24 scene cuts without manual inpainting."
          },
          {
            name: "Elena Rostova",
            handle: "@elena_vfx",
            text: "GenPlay shot contracts give our team predictable, repeatable framing. It feels like directing actual camera operators."
          },
          {
            name: "Devon Reed",
            handle: "@devonreed_ai",
            text: "Running our studio BYOK saved us over 70% in monthly API costs compared to seat-based video SaaS platforms."
          }
        ]}
        column2={[
          {
            name: "Sophie Zhang",
            handle: "@sophie_prod",
            text: "The 4-department structure keeps our storyboards, script revisions, and final color grade in tight lockstep."
          },
          {
            name: "Ethan Wright",
            handle: "@ethanw_cinema",
            text: "Automated shot assembly with human approval gates is the exact sweet spot for solo creators producing weekly episodes."
          },
          {
            name: "Aria Thorne",
            handle: "@ariathorne_media",
            text: "We went from concept to a 4-minute cinematic short in 48 hours. The pipeline architecture is brilliant."
          }
        ]}
      />

      {/* Section 5: [CTA1] Flowbite split dashboard CTA */}
      <FlowbiteCtaSection
        title="Build your private AI film studio today"
        description="Join solo directors and independent creators building lasting cinematic universes with Gem Studio. Zero per-seat markups, full creator ownership."
        ctaHref={entryHref}
        ctaLabel={authenticated ? "Open Production Floor" : "Create Free Studio"}
      />
    </div>
  );
}
