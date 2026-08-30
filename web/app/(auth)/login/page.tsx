import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { PrelineLoginCard } from "@/components/blocks/preline/preline-login-card";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <section className="form-page shell py-12" data-archetype="A2">
      <PrelineLoginCard
        kicker="Gem Studio"
        title="Sign in to your Studio"
        subtitle="Enter your credentials to access your production floor."
      >
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </PrelineLoginCard>
    </section>
  );
}
