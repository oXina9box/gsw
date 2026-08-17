"use client";
import { createClient } from "@/lib/supabase/browser";
export function SignOutButton() { return <button className="button button-outline" type="button" onClick={async () => { await createClient().auth.signOut(); window.location.href = "/"; }}>Sign out</button>; }
