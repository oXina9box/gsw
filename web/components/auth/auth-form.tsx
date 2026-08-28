"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({
  mode: initialMode,
  onModeChange,
  onSuccess,
}: {
  mode: Mode;
  onModeChange?: (mode: Mode) => void;
  onSuccess?: () => void;
}) {
  const [currentMode, setCurrentMode] = useState<Mode>(initialMode);
  const mode = onModeChange ? initialMode : currentMode;
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    params.get("error") === "auth_callback" ? "That sign-in link is invalid or expired." : ""
  );
  const [busy, setBusy] = useState(false);
  const isForgot = mode === "forgot";
  const isSignup = mode === "signup";
  const signupsDisabled = isSignup && process.env.NEXT_PUBLIC_SIGNUPS_ENABLED === "false";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      isForgot ? "/reset-password" : safeRedirectPath(params.get("next"))
    )}`;

    if (signupsDisabled) {
      setBusy(false);
      setMessage("Gem Studio is invite-only. Ask the studio owner for access.");
      return;
    }

    const result = isForgot
      ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback })
      : isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: callback,
              data: { full_name: fullName.trim() },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);

    if (result.error) {
      if (
        isSignup &&
        (result.error.message.toLowerCase().includes("rate limit") ||
          result.error.message.toLowerCase().includes("over_email_send_rate_limit") ||
          result.error.message.toLowerCase().includes("too many requests") ||
          result.error.message.toLowerCase().includes("security purposes") ||
          (result.error as { status?: number }).status === 429)
      ) {
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName: fullName.trim() }),
          });
          if (res.ok) {
            const signInResult = await supabase.auth.signInWithPassword({ email, password });
            if (!signInResult.error && signInResult.data?.session) {
              onSuccess?.();
              router.replace("/app");
              router.refresh();
              return;
            }
          }
        } catch {
          // fall through
        }
      }
      setError(result.error.message);
      return;
    }

    if (isForgot) {
      setMessage("If an account exists for that email, a reset link is on its way.");
      return;
    }

    if (isSignup) {
      if ("session" in result.data && result.data.session) {
        onSuccess?.();
        router.replace("/app");
        router.refresh();
        return;
      }

      // Auto-confirm email and sign in directly (testing mode fallback)
      const signUpUser =
        result.data &&
        typeof result.data === "object" &&
        "user" in result.data &&
        result.data.user &&
        typeof result.data.user === "object" &&
        "id" in result.data.user
          ? (result.data.user as { id: string })
          : null;

      if (signUpUser?.id) {
        try {
          await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: signUpUser.id, email, password, fullName: fullName.trim() }),
          });
          const signInResult = await supabase.auth.signInWithPassword({ email, password });
          if (!signInResult.error && signInResult.data?.session) {
            onSuccess?.();
            router.replace("/app");
            router.refresh();
            return;
          }
        } catch {
          // fall through to manual confirm message
        }
      }

      setMessage("Confirm your email: Check your inbox and click the verification link to activate your studio, or sign in below.");
      return;
    }

    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2") {
      router.replace(`/mfa?next=${encodeURIComponent(safeRedirectPath(params.get("next")))}`);
      return;
    }
    onSuccess?.();
    router.replace(safeRedirectPath(params.get("next")));
    router.refresh();
  }

  const title = isSignup ? "Create your Studio account" : isForgot ? "Reset your password" : "Welcome back";

  return (
    <div className="form-card">
      <p className="kicker">Gem Studio / account</p>
      <h1>{title}</h1>
      <form onSubmit={submit} noValidate>
        {isSignup ? (
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              required
              placeholder="e.g. Maya Lin"
              value={fullName}
              aria-describedby={error ? "auth-form-error" : undefined}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
        ) : null}
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="creator@studio.film"
            value={email}
            aria-describedby={error ? "auth-form-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {!isForgot && (
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              required
              placeholder="At least 8 characters"
              value={password}
              aria-describedby={error ? "auth-form-error" : undefined}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}
        <button className="button button-primary" disabled={busy || signupsDisabled} type="submit">
          {busy ? "Working…" : isSignup ? (signupsDisabled ? "Request access" : "Create Studio") : isForgot ? "Send reset link" : "Sign in"}
        </button>
      </form>
      {error && (
        <p id="auth-form-error" className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-note" role="status">
          {message}
        </p>
      )}
      <p className="form-note">
        {mode === "login" ? (
          <>
            {onModeChange ? (
              <button type="button" className="text-link" onClick={() => onModeChange("forgot")}>
                Forgot password?
              </button>
            ) : (
              <Link href="/forgot-password">Forgot password?</Link>
            )}{" "}
            ·{" "}
            {onModeChange ? (
              <button type="button" className="text-link" onClick={() => onModeChange("signup")}>
                Create Studio
              </button>
            ) : (
              <button type="button" className="text-link" onClick={() => setCurrentMode("signup")}>
                Create Studio
              </button>
            )}
          </>
        ) : isSignup ? (
          <>
            Already have an account?{" "}
            {onModeChange ? (
              <button type="button" className="text-link" onClick={() => onModeChange("login")}>
                Sign in
              </button>
            ) : (
              <button type="button" className="text-link" onClick={() => setCurrentMode("login")}>
                Sign in
              </button>
            )}
          </>
        ) : (
          <>
            Remembered it?{" "}
            {onModeChange ? (
              <button type="button" className="text-link" onClick={() => onModeChange("login")}>
                Sign in
              </button>
            ) : (
              <button type="button" className="text-link" onClick={() => setCurrentMode("login")}>
                Sign in
              </button>
            )}
          </>
        )}
      </p>
    </div>
  );
}
