import { EntryActions } from "@/components/marketing/entry-actions";
import { SignalBoard } from "@/components/marketing/signal-board";

export const metadata = { title: "Social Workshop", description: "Plan releases and return useful private audience signals to the next production." };

export default function SocialWorkshopPage() {
  return <article className="marketing-detail">
    <header className="detail-hero shell"><h1>The afterlife of <span>a good frame.</span></h1><p className="detail-lede">Plan how one master can become many platform-native points of entry, then carry the useful response into the next brief.</p><EntryActions /></header>
    <section className="social-detail-board shell"><div><h2>Cut for the platform. Learn for the next brief.</h2><p>These editorial examples show how native cuts and conversations become creative inputs. Private production signals stay inside the owner’s Studio.</p></div><SignalBoard /></section>
    <section className="detail-grid shell">
      <article><h2>Plan the real release.</h2><p>Keep notes for platform-specific cuts, captions, thumbnails, metadata, and schedules beside the approved production.</p></article>
      <article><h2>Destinations stay explicit.</h2><p>Direct OAuth connections and posting are not enabled in this build. They require approved platform adapters and least-privilege credentials.</p></article>
      <article><h2>Record what is available.</h2><p>Save performance, conversation, and release observations as workspace-scoped manual signals without pretending unsupported analytics are connected.</p></article>
      <article><h2>Keep the useful signal.</h2><p>Private signal cards and recommendations can seed a later brief—not a public profile or shared marketplace.</p></article>
    </section>
    <section className="detail-cta shell"><h2>Release planning and manual signals work now.</h2><p>Direct publishing, analytics sync, captions, thumbnails, and social derivatives remain disabled until their adapters are implemented and approved.</p></section>
  </article>;
}
