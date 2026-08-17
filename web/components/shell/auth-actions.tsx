"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function AuthActions({ userEmail }: { userEmail?: string }) {
  if (!userEmail) return <><Link className="button button-outline" href="/login">Sign in</Link><Link className="button button-primary" href="/signup">Create account</Link></>;
  return <><Link className="text-link" href="/account" aria-label={`Account for ${userEmail}`}>{userEmail}</Link><button className="button button-outline" type="button" onClick={async () => { await createClient().auth.signOut(); window.location.href = "/"; }}>Sign out</button></>;
}
