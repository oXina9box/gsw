import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { PrelineLoginCard } from "@/components/blocks/preline/preline-login-card";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <section className="form-page shell py-12" data-archetype="A2">
      <PrelineLoginCard
        kicker="Gem Studio"
        title="Reset your password"
        subtitle="Enter your email to receive recovery instructions."
      >
        <Suspense>
          <AuthForm mode="forgot" />
        </Suspense>
      </PrelineLoginCard>
    </section>
  );
}
