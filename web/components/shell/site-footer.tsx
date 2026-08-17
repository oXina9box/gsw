import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteFooter() {
  let user = null;
  try { user = (await (await createClient()).auth.getUser()).data.user; } catch {}
  return <footer className="site-footer shell">
    <div className="footer-statement">Films for the <span>next signal.</span></div>
    <div className="footer-links">
      <div><span className="footer-label">Navigate</span><Link href="/">Home</Link><Link href="/studio">The studio</Link><Link href="/system">The system</Link><Link href="/social-workshop">Social workshop</Link><Link href="/core-values">Core values</Link><Link href="/app">Dashboard</Link></div>
      <div><span className="footer-label">Account</span>{user ? <><Link href="/account">Account</Link><Link href="/app">Workspace</Link></> : <><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link></>}</div>
      <div><span className="footer-label">Legal</span><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><a href="mailto:hello@gemstudio.app">Contact</a></div>
    </div>
  </footer>;
}
