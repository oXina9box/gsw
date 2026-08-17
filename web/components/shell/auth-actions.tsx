"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function AuthActions({ authenticated, userEmail }: { authenticated: boolean; userEmail?: string }) {
  if (!authenticated) return <><Link className="button button-outline" href="/login">Sign in</Link><Link className="button button-primary" href="/signup">Create account</Link></>;
  return <><Link className="text-link" href="/account" aria-label={userEmail ? `Account for ${userEmail}` : "Account"}>{userEmail ?? "Account"}</Link><button className="button button-outline" type="button" onClick={async () => { await createClient().auth.signOut(); window.location.href = "/"; }}>Sign out</button></>;
}
