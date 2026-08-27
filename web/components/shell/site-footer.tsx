import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GemBrandIcon } from "./gem-brand-icon";

export async function SiteFooter() {
  const contentApproved = process.env.SITE_CONTENT_APPROVED === "true";
  let user = null;
  try { user = (await (await createClient()).auth.getUser()).data.user; } catch { /* Public shell remains available before Supabase configuration. */ }
  return <footer className="site-footer shell">
    <div className="footer-statement"><span className="footer-mark"><GemBrandIcon /> GS/13</span><p>Films for the <span>next signal.</span></p></div>
    <div className="footer-meta">
      <div><span className="footer-label">Navigate</span><Link href="/">Home</Link><Link href="/studio">The studio</Link><Link href="/system">The system</Link><Link href="/social-workshop">Social workshop</Link>{contentApproved ? <Link href="/core-values">Core values</Link> : null}<Link href="/app">Studio floor</Link></div>
      <div><span className="footer-label">Account</span>{user ? <><Link href="/account">Account</Link><Link href="/app">Open Studio</Link></> : <><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link></>}</div>
      <div><span className="footer-label">Legal & contact</span><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><a href="https://github.com/oXina9box/gem-studio">Source code</a><a href="mailto:hello@gemstudio.app">hello@gemstudio.app</a></div>
    </div>
  </footer>;
}
