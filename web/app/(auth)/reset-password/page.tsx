"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter(); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); const { error } = await createClient().auth.updateUser({ password }); if (error) { setError(error.message); return; } setMessage("Password updated."); setTimeout(() => router.replace("/app"), 500); }
  return <section className="form-page"><div className="form-card"><p className="kicker">Gem Studio / account</p><h1>Choose a new password.</h1><form onSubmit={submit}><label>New password<input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button-primary" type="submit">Update password</button></form>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-note" role="status">{message}</p>}</div></section>;
}
