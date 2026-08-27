import { Suspense } from "react";
import { MfaChallenge } from "@/components/auth/mfa-challenge";

export const metadata = { title: "Two-step verification" };

export default function MfaPage() {
  return <section className="form-page" data-archetype="A2"><Suspense fallback={<div className="form-card"><p>Loading verification…</p></div>}><MfaChallenge /></Suspense></section>;
}
