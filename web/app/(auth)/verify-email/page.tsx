import Link from "next/link";
import { PrelineLoginCard } from "@/components/blocks/preline/preline-login-card";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <section className="form-page shell py-12" data-archetype="A2">
      <PrelineLoginCard
        kicker="Gem Studio / account"
        title="Check your email."
        subtitle="Use the confirmation link we sent to finish setting up your account."
        footer={
          <Link className="button button-primary w-full" href="/app">
            Open workspace
          </Link>
        }
      >
        <p className="text-sm text-text-muted font-body leading-relaxed">
          If you have already confirmed your email address, you can continue directly into your studio workspace.
        </p>
      </PrelineLoginCard>
    </section>
  );
}
