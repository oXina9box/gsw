"use client";

import { useState } from "react";
import { cancelAccountDeletion, requestAccountDeletion } from "@/app/(product)/account/actions";

export function DeleteAccountButton({ purgeAfter }: { purgeAfter?: string | null }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (purgeAfter) return <div><p className="form-error">Deletion scheduled for {new Date(purgeAfter).toLocaleDateString()}. You can cancel any time before then.</p><form action={cancelAccountDeletion}><button className="button button-outline" type="submit">Cancel deletion</button></form></div>;

  if (!showConfirm) {
    return <button className="button button-outline danger" type="button" onClick={() => setShowConfirm(true)}>Delete account</button>;
  }

  return <div className="danger-panel">
    <h3>Confirm account deletion</h3>
    <p>This will schedule your account and all associated data for permanent deletion after 30 days. You can cancel any time during that period.</p>
    <form action={requestAccountDeletion} className="stack-form">
      <label>Confirm current password<input name="password" type="password" minLength={8} autoComplete="current-password" required /></label>
      <label>Authenticator code <small>(required only when MFA is enabled)</small><input name="mfa_code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" /></label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button className="button button-outline danger" type="submit">Confirm deletion</button>
        <button className="button button-outline" type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
      </div>
    </form>
  </div>;
}
