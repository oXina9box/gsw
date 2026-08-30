"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendContactMessage, type ContactState } from "./actions";
import { Reveal } from "@/components/blocks/reveal";
import { KometaContact } from "@/components/blocks/kometa/kometa-contact";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(sendContactMessage, {});

  const contactInfo = [
    { label: "Email", value: "hello@gemstudio.app", href: "mailto:hello@gemstudio.app" },
    { label: "Community", value: "GitHub Discussions", href: "https://github.com/oXina9box/gem-studio" },
    { label: "Headquarters", value: "Global · Decentralized Creative Engine" },
  ];

  const formContent = state?.success ? (
    <div className="p-6 border border-lime/40 bg-lime/10 rounded-md space-y-3" role="status">
      <h2 className="font-display text-xl font-bold text-lime">Message received</h2>
      <p className="text-sm text-text-muted font-body">
        Thank you for reaching out. We will get back to you shortly.
      </p>
      <div className="pt-2">
        <Link className="button button-outline" href="/docs">
          Browse Documentation ↗
        </Link>
      </div>
    </div>
  ) : (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 border border-red/40 bg-red/10 text-red text-xs font-mono rounded-sm" role="alert">
          {state.error}
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor="email" className="block font-mono text-xs text-text-muted uppercase tracking-wider">
          Your Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          placeholder="creator@example.com"
          className="w-full px-3 py-2 border border-border bg-bg text-text rounded-sm text-sm font-body focus:border-cyan focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="message" className="block font-mono text-xs text-text-muted uppercase tracking-wider">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="How can we assist your production workflow?"
          className="w-full px-3 py-2 border border-border bg-bg text-text rounded-sm text-sm font-body focus:border-cyan focus:outline-none resize-y"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="button button-primary w-full"
      >
        {isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );

  return (
    <article className="marketing-detail" data-archetype="A2">
      <Reveal>
        <div className="shell">
          <KometaContact
            kicker="Support & Inquiries"
            title="Get in touch. We are here to help."
            lede="Questions about Gem Studio, private enterprise deployments, or custom agent development? Send us a message."
            infoItems={contactInfo}
            formSlot={formContent}
          />
        </div>
      </Reveal>

      <Reveal>
        <section className="detail-cta shell">
          <h2>Prefer to explore on your own?</h2>
          <Link className="button button-outline" href="/docs">
            Read the Documentation ↗
          </Link>
        </section>
      </Reveal>
    </article>
  );
}
