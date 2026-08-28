import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function EntryActions({ secondaryHref = "/?auth=login" }: { secondaryHref?: string }) {
  let authenticated = false;
  try { authenticated = Boolean((await (await createClient()).auth.getUser()).data.user); } catch { /* Public pages work before Supabase is configured. */ }

  return <div className="hero-actions">
    <Link className="button button-primary" href={authenticated ? "/app" : "/?auth=signup"}>{authenticated ? "Open your Studio" : "Create your Studio"} ↗</Link>
    <Link className="button button-outline" href={authenticated ? "/account" : secondaryHref}>{authenticated ? "Account" : "Sign in"}</Link>
  </div>;
}
