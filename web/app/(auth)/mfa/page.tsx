import { Suspense } from "react";
import Link from "next/link";
import { MfaChallenge } from "@/components/auth/mfa-challenge";
import { PrelineSplitAuth } from "@/components/blocks/preline/preline-vertical-marquee";

export const metadata = { title: "Two-step verification" };

export default function MfaPage() {
  return (
    <section className="shell py-8" data-archetype="A2">
      <PrelineSplitAuth
        title="Two-step verification"
        subtitle="Enter the 6-digit verification code from your authenticator app to access your production floor."
        sidebarTagline="Lorem ipsum"
        sidebarHeadline="Lorem ipsum dolor sit amet consectetur"
        footer={
          <p className="text-text-muted">
            Lost access to your device?{" "}
            <Link href="/contact" className="text-cyan hover:underline font-semibold font-mono">
              Contact Studio Support →
            </Link>
          </p>
        }
      >
        <Suspense fallback={<p className="text-text-muted text-sm font-mono py-6 text-center">Loading challenge...</p>}>
          <MfaChallenge />
        </Suspense>
      </PrelineSplitAuth>
    </section>
  );
}
