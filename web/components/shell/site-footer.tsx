import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { GemLogo } from "./gem-brand-icon";

export async function SiteFooter() {
  const contentApproved = process.env.SITE_CONTENT_APPROVED === "true";
  let user = null;
  try { user = (await (await createClient()).auth.getUser()).data.user; } catch { /* Public shell remains available before Supabase configuration. */ }
  const protectedHref = (href: string) => (user ? href : `/login?next=${encodeURIComponent(href)}`);
  return <footer className="site-footer shell">
    <div className="footer-statement">
      <Link className="wordmark footer-logo" href="/" aria-label="Gem Studio home">
        <GemLogo width={128} />
      </Link>
    </div>
    <div className="footer-meta">
      <div>
        <span className="footer-label">Explore</span>
        <Link href="/">Home</Link>
        <Link href="/studio">The studio</Link>
        <Link href="/system">The system</Link>
        <Link href="/social-workshop">Social workshop</Link>
        <Link href="/gallery">Gallery / Work</Link>
        <Link href="/portfolio">Portfolio</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/pricing">Pricing &amp; license</Link>
        {contentApproved ? <Link href="/core-values">Core values</Link> : null}
        <Link href="/contact">Contact</Link>
      </div>
      <div>
        <span className="footer-label">Front Office</span>
        <Link href={protectedHref("/app")}>Overview</Link>
        <Link href={protectedHref("/app/channels")}>Channels</Link>
        <Link href={protectedHref("/app/marketing")}>Marketing</Link>
        <Link href={protectedHref("/app/social")}>Socials</Link>
        <Link href={protectedHref("/app/staffing")}>Staffing</Link>
      </div>
      <div>
        <span className="footer-label">Studio</span>
        <Link href={protectedHref("/app/studio")}>Production floor</Link>
        <Link href={protectedHref("/app/assets")}>Assets</Link>
        <Link href={protectedHref("/app/universe")}>Universe</Link>
        <Link href={protectedHref("/app/orchestration")}>Orchestration</Link>
      </div>
      <div>
        <span className="footer-label">Account</span>
        {user ? <>
          <Link href="/account">Account</Link>
          <Link href={protectedHref("/app/billing")}>Billing</Link>
          <Link href={protectedHref("/app/integrations")}>Integrations</Link>
          <SignOutButton />
        </> : <>
          <Link href="/?auth=login">Sign in</Link>
          <Link href="/?auth=signup">Create Studio</Link>
        </>}
      </div>
      <div>
        <span className="footer-label">Legal &amp; contact</span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <a href="https://github.com/oXina9box/gem-studio">Source code</a>
        <a href="mailto:hello@gemstudio.app">hello@gemstudio.app</a>
        <Link href="/do-not-click">Do Not Click</Link>
      </div>
    </div>
  </footer>;
}
