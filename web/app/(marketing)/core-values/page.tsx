import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/blocks/reveal";
import { KometaFeaturesGrid, type FeatureItem } from "@/components/blocks/kometa/kometa-features-grid";

export const metadata = { title: "Core Values" };

const values: FeatureItem[] = [
  {
    number: "01",
    signalColor: "pink",
    title: "Continuity First",
    description: "Every decision carries forward through release. Use versioned DNA and traceable approvals.",
  },
  {
    number: "02",
    signalColor: "cyan",
    title: "Bounded Automation",
    description: "Automation moves inside human-set limits. Make approval gates, provider limits, and credit caps visible.",
  },
  {
    number: "03",
    signalColor: "lime",
    title: "Private Ownership",
    description: "Creators retain control of studio material. Keep keys encrypted, workspace boundaries explicit, exports available.",
  },
  {
    number: "04",
    signalColor: "amber",
    title: "Human Direction",
    description: "People decide what ships. Treat review as creative direction, not checkbox.",
  },
];

export default function CoreValuesPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") notFound();

  return (
    <article className="reading-page shell" data-archetype="A2">
      <header className="py-8 space-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
          Core values
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-text">
          What guides the studio.
        </h1>
        <p className="text-base text-text-muted font-body">
          Principles shape briefs, handoffs, AI use, review, and release.
        </p>
      </header>

      <Reveal>
        <KometaFeaturesGrid
          features={values}
          columns={2}
        />
      </Reveal>

      <div className="flex items-center gap-4 py-8">
        <Link className="button button-primary" href="/?auth=signup">
          Create your account ↗
        </Link>
        <Link className="button button-outline" href="/">
          Back to the studio
        </Link>
      </div>
    </article>
  );
}
