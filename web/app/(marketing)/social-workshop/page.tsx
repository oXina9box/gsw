import { EntryActions } from "@/components/marketing/entry-actions";
import { SignalBoard } from "@/components/marketing/signal-board";
import { Reveal } from "@/components/blocks/reveal";
import { KometaFeaturesGrid } from "@/components/blocks/kometa/kometa-features-grid";

export const metadata = {
  title: "Social Workshop",
  description:
    "Plan releases and return useful private audience signals to the next production.",
};

const workshopFeatures = [
  {
    number: "01",
    signalColor: "pink" as const,
    title: "Plan the real release.",
    description:
      "Keep notes for platform-specific cuts, captions, thumbnails, metadata, and schedules beside the approved production.",
  },
  {
    number: "02",
    signalColor: "cyan" as const,
    title: "Destinations stay explicit.",
    description:
      "Direct OAuth connections and posting are not enabled in this build. They require approved platform adapters and least-privilege credentials.",
  },
  {
    number: "03",
    signalColor: "lime" as const,
    title: "Record what is available.",
    description:
      "Save performance, conversation, and release observations as workspace-scoped manual signals without pretending unsupported analytics are connected.",
  },
  {
    number: "04",
    signalColor: "amber" as const,
    title: "Keep the useful signal.",
    description:
      "Private signal cards and recommendations can seed a later brief—not a public profile or shared marketplace.",
  },
];

export default function SocialWorkshopPage() {
  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <h1>
          The afterlife of <span>a good frame.</span>
        </h1>
        <p className="detail-lede">
          Plan how one master can become many platform-native points of entry, then carry the useful response into the next brief.
        </p>
        <EntryActions />
      </header>

      <Reveal>
        <section className="social-detail-board shell">
          <div>
            <h2>Cut for the platform. Learn for the next brief.</h2>
            <p>
              These editorial examples show how native cuts and conversations become creative inputs. Private production signals stay inside the owner’s Studio.
            </p>
          </div>
          <SignalBoard />
        </section>
      </Reveal>

      <Reveal>
        <div className="shell">
          <KometaFeaturesGrid
            kicker="Signal Integration"
            title="Audience intelligence in the loop"
            features={workshopFeatures}
            columns={2}
          />
        </div>
      </Reveal>

      <Reveal>
        <section className="detail-cta shell">
          <h2>Release planning and manual signals work now.</h2>
          <p>
            Direct publishing, analytics sync, captions, thumbnails, and social derivatives remain disabled until their adapters are implemented and approved.
          </p>
        </section>
      </Reveal>
    </article>
  );
}
