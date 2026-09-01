import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KometaC2Section, KometaStepSection } from "@/components/blocks/kometa/kometa-approved-sections";
import { PrelineVerticalMarquee } from "@/components/blocks/preline/preline-vertical-marquee";
import { FlowbiteCtaSection } from "@/components/blocks/flowbite/flowbite-cta";

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
      {/* Marquee Hero Section */}
      <section className="py-12 sm:py-20 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="pulse-dot" />
            <span className="font-mono text-xs uppercase tracking-widest text-cyan">
              Lorem ipsum dolor sit
            </span>
          </div>

          <h1
            className="font-display font-extrabold tracking-tight text-text leading-tight mb-6"
            style={{ fontSize: "clamp(2.8rem,7vw,6rem)" }}
          >
            Lorem ipsum dolor <span className="text-pink">consectetur.</span>
          </h1>

          <p className="max-w-3xl text-lg sm:text-xl text-text-muted font-body leading-relaxed mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-pink font-mono text-sm font-semibold text-ink transition-colors hover:bg-pink-hover shadow-md"
              href={entryHref}
            >
              {authenticated ? "Open workspace" : "Create Studio"}
            </Link>
            <Link
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-border font-mono text-sm font-medium text-text transition-colors hover:border-cyan hover:text-cyan"
              href="/studio"
            >
              Explore the studio
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: [C2] 2-column feature highlight */}
      <KometaC2Section
        title={
          <span>
            Lorem ipsum dolor <span className="text-cyan">sit amet.</span>
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
        imageSrc="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        imageAlt="Gem Studio Feature"
        highlightColor="cyan"
      />

      {/* Section 3: [S1] 3-step production pipeline */}
      <KometaStepSection
        badge="Lorem ipsum pipeline"
        title="Lorem ipsum dolor sit amet consectetur"
        lede="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        steps={[
          {
            step: "01",
            title: "Lorem ipsum dolor",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.",
            href: "/studio",
            linkLabel: "Learn more →"
          },
          {
            step: "02",
            title: "Consectetur adipiscing",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.",
            href: "/system",
            linkLabel: "Learn more →"
          },
          {
            step: "03",
            title: "Sed do eiusmod",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.",
            href: "/pricing",
            linkLabel: "Learn more →"
          }
        ]}
      />

      {/* Section 4: [VM] Vertical dual testimonial marquee */}
      <PrelineVerticalMarquee
        title="Lorem ipsum dolor sit amet"
        subtitle="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        column1={[
          {
            name: "Marcus Vance",
            handle: "@marcus_film",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          },
          {
            name: "Elena Rostova",
            handle: "@elena_vfx",
            text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          },
          {
            name: "Devon Reed",
            handle: "@devonreed_ai",
            text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
          }
        ]}
        column2={[
          {
            name: "Sarah Chen",
            handle: "@sarah_director",
            text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          },
          {
            name: "Tariq Morales",
            handle: "@tariq_creative",
            text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
          },
          {
            name: "Kira Sato",
            handle: "@kira_animates",
            text: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni."
          }
        ]}
      />

      {/* Section 5: [CTA] Statement band */}
      <FlowbiteCtaSection
        title="Lorem ipsum dolor sit amet consectetur"
        description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        ctaHref="/?auth=signup"
        ctaLabel="Create Studio →"
      />
    </div>
  );
}
