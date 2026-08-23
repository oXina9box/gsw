"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

type Factor = { id: string; status: string; friendly_name?: string };

export function MfaSettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }
  useEffect(() => {
    void createClient().auth.mfa.listFactors().then(({ data }) => setFactors(data?.totp ?? []));
  }, []);

  async function enroll() {
    setMessage("");
    const { data, error } = await createClient().auth.mfa.enroll({ factorType: "totp", friendlyName: "Gem Studio" });
    if (error) { setMessage(error.message); return; }
    setEnrollment({ id: data.id, qr: data.totp.qr_code });
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!enrollment || !/^\d{6}$/.test(code)) { setMessage("Enter the six-digit code."); return; }
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
    if (challengeError) { setMessage(challengeError.message); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId: enrollment.id, challengeId: challenge.id, code });
    if (error) { setMessage(error.message); return; }
    setEnrollment(null); setCode(""); setMessage("Authenticator enabled."); await refresh();
  }

  async function remove(id: string) {
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    setMessage(error?.message ?? "Authenticator removed.");
    if (!error) await refresh();
  }

  return <div><h2>Authenticator app</h2><p className="muted">Optional TOTP verification protects your Studio even if your password is exposed.</p>{factors.filter((factor) => factor.status === "verified").map((factor) => <div className="data-row" key={factor.id}><strong>{factor.friendly_name || "Authenticator"}</strong><span>verified</span><button className="button button-outline" type="button" onClick={() => void remove(factor.id)}>Remove</button></div>)}{!enrollment ? <button className="button button-outline" type="button" onClick={() => void enroll()}>Add authenticator</button> : <form className="stack-form" onSubmit={verify}><Image className="mfa-qr" src={enrollment.qr} width={192} height={192} unoptimized alt="Authenticator setup QR code" /><label>Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required /></label><button className="button button-primary" type="submit">Verify authenticator</button></form>}{message ? <p className="form-note" role="status">{message}</p> : null}</div>;
}
