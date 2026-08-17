import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthActions } from "./auth-actions";

export async function SiteHeader() {
  let user = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    // Public pages remain renderable before environment configuration exists.
  }
  return <header className="site-header shell">
    <Link className="wordmark" href="/"><span className="wordmark-mark">✦</span>GEM STUDIO</Link>
    <nav className="main-nav" id="main-nav" aria-label="Primary navigation">
      <Link href="/#studio">The studio</Link><Link href="/#system">The system</Link><Link href="/#social">Social workshop</Link><Link href="/core-values">Core values</Link>
      {user ? <><Link href="/app">Dashboard</Link><Link href="/app/builder">Builder</Link></> : null}
    </nav>
    <div className="header-actions"><AuthActions userEmail={user?.email} /><button className="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="Open navigation"><span></span><span></span></button></div>
  </header>;
}
