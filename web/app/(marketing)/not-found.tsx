import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-20 text-center animate-on-scroll [animation:animationIn_0.8s_ease-out_0.1s_both]">
      <div className="mx-auto max-w-xl px-4">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-semibold tracking-wider uppercase rounded-full border border-pink/30 text-pink bg-pink/10">
          404
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-text tracking-tight mb-4">
          Lorem ipsum dolor sit amet.
        </h1>
        <p className="text-base text-text-muted font-body leading-relaxed mb-8">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <Link
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-pink font-mono text-sm font-semibold text-ink transition-colors hover:bg-pink-hover shadow-md"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
