import Link from "next/link";
import { Reveal } from "@/components/blocks/reveal";
import { FlowbiteVideo } from "@/components/blocks/flowbite/flowbite-video";

export const metadata = { title: "Do not click", robots: { index: false, follow: false } };

export default function DoNotClickPage() {
  return (
    <article className="marketing-detail" data-archetype="A1">
      <header className="detail-hero shell">
        <p className="eyebrow">Lorem ipsum</p>
        <h1>Lorem ipsum <span>dolor.</span></h1>
        <p className="detail-lede">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </header>

      <Reveal>
        <section className="detail-band shell">
          <div className="w-full max-w-4xl mx-auto">
            <FlowbiteVideo
              title="Lorem Ipsum Video"
              caption="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
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
          <h2>Lorem ipsum dolor sit amet.</h2>
          <Link className="button button-outline" href="/">
            Return home ↗
          </Link>
        </section>
      </Reveal>
    </article>
  );
}
