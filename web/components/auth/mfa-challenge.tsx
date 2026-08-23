"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/browser";

export function MfaChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { void createClient().auth.mfa.listFactors().then(({ data }) => setFactorId(data?.totp.find((factor) => factor.status === "verified")?.id ?? "")); }, []);

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code)) { setError("Enter the six-digit code from your authenticator."); return; }
    setBusy(true); setError("");
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) { setBusy(false); setError(challengeError.message); return; }
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    setBusy(false);
    if (verifyError) { setError(verifyError.message); return; }
    router.replace(safeRedirectPath(searchParams.get("next")));
    router.refresh();
  }

  return <div className="form-card"><p className="kicker">Gem Studio / security</p><h1>Two-step verification</h1><p>Enter the code from your authenticator app.</p><form onSubmit={verify}><label>Six-digit code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required autoFocus /></label><button className="button button-primary" type="submit" disabled={busy || !factorId}>{busy ? "Verifying…" : "Verify"}</button></form>{error ? <p className="form-error" role="alert">{error}</p> : null}</div>;
}
