"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { openAuthModal } from "@/components/auth/auth-modal";

export function AuthActions({ authenticated, userEmail }: { authenticated: boolean; userEmail?: string }) {
  const router = useRouter();
  if (!authenticated) return <>
    <button className="button button-outline" type="button" onClick={() => openAuthModal("login")}>Sign in</button>
    <button className="button button-primary" type="button" onClick={() => openAuthModal("signup")}>Create Studio</button>
  </>;
  return <><Link className="text-link" href="/account" aria-label={userEmail ? `Account for ${userEmail}` : "Account"}>Account</Link><button className="button button-outline" type="button" onClick={async () => { await createClient().auth.signOut(); router.push("/"); router.refresh(); }}>Sign out</button></>;
}
