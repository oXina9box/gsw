import { cancelAccountDeletion, requestAccountDeletion } from "@/app/(product)/account/actions";

export function DeleteAccountButton({ purgeAfter }: { purgeAfter?: string | null }) {
  if (purgeAfter) return <div><p className="form-error">Deletion scheduled for {new Date(purgeAfter).toLocaleDateString()}. You can cancel any time before then.</p><form action={cancelAccountDeletion}><button className="button button-outline" type="submit">Cancel deletion</button></form></div>;
  return <form action={requestAccountDeletion} className="stack-form"><label>Confirm current password<input name="password" type="password" minLength={8} autoComplete="current-password" required /></label><label>Authenticator code <small>(required only when MFA is enabled)</small><input name="mfa_code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" /></label><button className="button button-outline danger" type="submit">Schedule account deletion</button><small>Data remains recoverable for 30 days, then is permanently purged.</small></form>;
}
