"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function DeleteAccountButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function deleteAccount() {
    if (!window.confirm("Delete your account and workspace data? This cannot be undone.")) return;
    setBusy(true); setError("");
    const { error: invokeError } = await createClient().functions.invoke("delete-account");
    if (invokeError) { setError("Account deletion failed. Try again or contact support."); setBusy(false); return; }
    window.location.href = "/";
  }
  return <div><button className="button button-outline danger" type="button" onClick={deleteAccount} disabled={busy}>{busy ? "Deleting…" : "Delete account"}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
