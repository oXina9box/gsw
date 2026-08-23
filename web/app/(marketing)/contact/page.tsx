"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendContactMessage, type ContactState } from "./actions";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(sendContactMessage, {});

  return (
    <article className="marketing-detail">
      <header className="detail-hero shell">
        <h1>Get in touch. <span>We are here to help.</span></h1>
        <p className="detail-lede">
          Questions about Gem Studio, private enterprise deployments, or custom agent development? Send us a message.
        </p>
      </header>

      <section className="detail-band shell">
        <div style={{ maxWidth: "560px", margin: "0 auto", width: "100%" }}>
          {state?.success ? (
            <div className="notice notice-success" role="status" style={{ padding: "1.5rem", borderRadius: "8px", background: "var(--surface-muted, #1a1a1a)", border: "1px solid var(--border-subtle, #333)", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Message received</h2>
              <p>Thank you for reaching out. We will get back to you shortly.</p>
              <div style={{ marginTop: "1rem" }}>
                <Link className="button button-outline" href="/docs">Browse Documentation ↗</Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="stack" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {state?.error && (
                <div role="alert" style={{ color: "#ef4444", fontSize: "0.875rem" }}>
                  {state.error}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="email" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Your Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="creator@example.com"
                  className="input"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", background: "var(--surface-muted, #111)", border: "1px solid var(--border-subtle, #333)", color: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="message" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={5}
                  placeholder="How can we assist your production workflow?"
                  className="textarea"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", background: "var(--surface-muted, #111)", border: "1px solid var(--border-subtle, #333)", color: "inherit", resize: "vertical" }}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="button button-primary"
                style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
              >
                {isPending ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="detail-cta shell">
        <h2>Prefer to explore on your own?</h2>
        <Link className="button button-outline" href="/docs">Read the Documentation ↗</Link>
      </section>
    </article>
  );
}
