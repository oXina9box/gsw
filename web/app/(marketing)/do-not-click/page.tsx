import Link from "next/link";
import { Reveal } from "@/components/blocks/reveal";
import { FlowbiteVideo } from "@/components/blocks/flowbite/flowbite-video";

export const metadata = { title: "Do not click", robots: { index: false, follow: false } };

export default function DoNotClickPage() {
  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <p className="eyebrow">You were warned</p>
        <h1>One little <span>video.</span></h1>
        <p className="detail-lede">A tiny easter egg for people who read all the way to the footer.</p>
      </header>

      <Reveal>
        <section className="detail-band shell">
          <div className="w-full max-w-4xl mx-auto">
            <FlowbiteVideo
              title="Studio Easter Egg"
              caption="You scrolled all the way to the end of the script."
              className="border-cyan/40"
            />
            <div className="mt-4 aspect-video w-full border border-border bg-surface rounded-md overflow-hidden">
              <iframe
                title="AI Rickroll"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                className="w-full h-full border-0"
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="detail-cta shell">
          <h2>Back to making something real.</h2>
          <Link className="button button-outline" href="/">
            Return home ↗
          </Link>
        </section>
      </Reveal>
    </article>
  );
}
