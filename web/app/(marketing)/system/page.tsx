import Link from "next/link";
import { EntryActions } from "@/components/marketing/entry-actions";
import { Reveal } from "@/components/blocks/reveal";
import { KometaSteps, type StepItem } from "@/components/blocks/kometa/kometa-steps";
import { KometaFeaturesGrid } from "@/components/blocks/kometa/kometa-features-grid";

export const metadata = {
  title: "The System",
  description:
    "See how Gem Studio moves a brief through approvals, GenPlay, shot uploads, MP4 assembly, and release planning.",
};

const systemSteps: StepItem[] = [
  {
    index: "01",
    title: "Brief & strategy",
    description:
      "Define the channel, audience, intent, constraints, rights, schedule, run mode, and maximum spend.",
    status: "completed",
  },
  {
    index: "02",
    title: "Story & continuity",
    description:
      "Develop story through screenplay, cast from the private Universe, and preserve approved character, location, and prop references.",
    status: "active",
  },
  {
    index: "03",
    title: "GenPlay & shots",
    description:
      "Create a read-only generation prompt for each shot. Copy it to the video tool you choose, then upload each version against the exact shot.",
    status: "pending",
  },
  {
    index: "04",
    title: "Assembly & release",
    description:
      "Select one compatible MP4 per shot, assemble them into a master, then plan the release and record its useful signals.",
    status: "pending",
  },
];

const systemFeatures = [
  {
    number: "01",
    signalColor: "pink" as const,
    title: "Use the model that fits the role.",
    description:
      "Official adapters and OpenAI-compatible endpoints can route compatible text, image, and audio work across free, mid, and quality tiers. Your credentials remain server-side and masked.",
  },
  {
    number: "02",
    signalColor: "cyan" as const,
    title: "GenPlay stays readable.",
    description:
      "Version one does not pretend every video provider has the same API. Copy the approved prompt, generate externally, and upload versions to the exact GenPlay shot.",
  },
  {
    number: "03",
    signalColor: "lime" as const,
    title: "Selections become a master.",
    description:
      "Once every required shot has a selected compatible MP4, the assembly worker joins those clips into one private master while preserving shot versions.",
  },
  {
    number: "04",
    signalColor: "amber" as const,
    title: "Spend is bounded before work starts.",
    description:
      "The visible fixed job price is reserved before provider work and released after failure or cancellation. A balance never silently drops below zero.",
  },
];

export default function SystemPage() {
  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <h1>
          The system is <span>the creative.</span>
        </h1>
        <p className="detail-lede">
          Gem Studio turns production into a visible sequence of decisions. Agents can keep work moving; users keep control of approvals, providers, credits, and release.
        </p>
        <EntryActions />
      </header>

      <Reveal>
        <div className="shell">
          <KometaSteps
            kicker="Production Lifecycle"
            title="Step-by-step verified execution"
            steps={systemSteps}
          />
        </div>
      </Reveal>

      <Reveal>
        <section className="run-mode-panel shell">
          <div>
            <h2>Choose where the system waits.</h2>
          </div>
          <div className="run-mode-list">
            <p>
              <strong>Manual</strong>
              <span>You start each next step.</span>
            </p>
            <p>
              <strong>Semi-auto</strong>
              <span>The workflow runs until a configured gate.</span>
            </p>
            <p>
              <strong>Auto</strong>
              <span>The workflow continues within policy, provider, and credit limits.</span>
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <div className="shell">
          <KometaFeaturesGrid
            kicker="Execution Governance"
            title="Designed for deterministic control"
            features={systemFeatures}
            columns={2}
          />
        </div>
      </Reveal>

      <Reveal>
        <section className="detail-cta shell">
          <h2>A release is the start of the next signal.</h2>
          <Link className="button button-outline" href="/social-workshop">
            Explore the social workshop ↗
          </Link>
        </section>
      </Reveal>
    </article>
  );
}
