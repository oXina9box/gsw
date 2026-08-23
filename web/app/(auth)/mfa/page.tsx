import { Suspense } from "react";
import { MfaChallenge } from "@/components/auth/mfa-challenge";

export const metadata = { title: "Two-step verification" };

export default function MfaPage() {
  return <Suspense fallback={<div className="form-card"><p>Loading verification…</p></div>}><MfaChallenge /></Suspense>;
}
