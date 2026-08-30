import { Suspense } from "react";
import { MfaChallenge } from "@/components/auth/mfa-challenge";
import { PrelineLoginCard } from "@/components/blocks/preline/preline-login-card";

export const metadata = { title: "Two-step verification" };

export default function MfaPage() {
  return (
    <section className="form-page shell py-12" data-archetype="A2">
      <PrelineLoginCard
        kicker="Two-Factor Authentication"
        title="Verify your identity"
        subtitle="Enter your authentication code to continue."
      >
        <Suspense fallback={<p className="text-text-muted text-sm font-mono">Loading verification…</p>}>
          <MfaChallenge />
        </Suspense>
      </PrelineLoginCard>
    </section>
  );
}
