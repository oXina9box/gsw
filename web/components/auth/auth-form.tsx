"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(params.get("error") === "auth_callback" ? "That sign-in link is invalid or expired." : "");
  const [busy, setBusy] = useState(false);
  const isForgot = mode === "forgot";
  const signupsDisabled = mode === "signup" && process.env.NEXT_PUBLIC_SIGNUPS_ENABLED === "false";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(isForgot ? "/reset-password" : safeRedirectPath(params.get("next")))}`;
    if (signupsDisabled) {
      setBusy(false); setMessage("Gem Studio is invite-only. Ask the studio owner for access."); return;
    }
    const result = isForgot
      ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback })
      : mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: callback } })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    if (isForgot) { setMessage("If an account exists for that email, a reset link is on its way."); return; }
    if (mode === "signup") {
      if ("session" in result.data && result.data.session) {
        router.replace("/app/onboarding");
        router.refresh();
        return;
      }
      // Auto-confirm email and sign in directly (testing mode)
      const signUpUser = result.data && typeof result.data === "object" && "user" in result.data && result.data.user && typeof result.data.user === "object" && "id" in result.data.user ? (result.data.user as { id: string }) : null;
      if (signUpUser?.id) {
        try {
          await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: signUpUser.id }),
          });
          const signInResult = await supabase.auth.signInWithPassword({ email, password });
          if (!signInResult.error && signInResult.data?.session) {
            router.replace("/app/onboarding");
            router.refresh();
            return;
          }
        } catch {
          // fall through to manual confirm message
        }
      }
      setMessage("Account created. Check your email to confirm your account, or sign in.");
      return;
    }
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
      router.replace(`/mfa?next=${encodeURIComponent(safeRedirectPath(params.get("next")))}`);
      return;
    }
    router.replace(safeRedirectPath(params.get("next")));
    router.refresh();
  }

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  return <div className="form-card"><p className="kicker">Gem Studio / account</p><h1>{title}</h1>
    <form onSubmit={submit} noValidate>
      <label>Email<input type="email" autoComplete="email" required value={email} aria-describedby={error ? "auth-form-error" : undefined} onChange={(event) => setEmail(event.target.value)} /></label>
      {!isForgot && <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required value={password} aria-describedby={error ? "auth-form-error" : undefined} onChange={(event) => setPassword(event.target.value)} /></label>}
      <button className="button button-primary" disabled={busy || signupsDisabled} type="submit">{busy ? "Working…" : mode === "signup" ? (signupsDisabled ? "Request access" : "Create account") : isForgot ? "Send reset link" : "Sign in"}</button>
    </form>
    {error && <p id="auth-form-error" className="form-error" role="alert">{error}</p>}
    {message && <p className="form-note" role="status">{message}</p>}
    <p className="form-note">{mode === "login" ? <><Link href="/forgot-password">Forgot password?</Link> · <Link href="/signup">Create account</Link></> : mode === "signup" ? <>Already have an account? <Link href="/login">Sign in</Link></> : <>Remembered it? <Link href="/login">Sign in</Link></>}</p>
  </div>;
}
