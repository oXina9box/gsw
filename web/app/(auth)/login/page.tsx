import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { PrelineSplitAuth } from "@/components/blocks/preline/preline-vertical-marquee";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <section className="shell py-8" data-archetype="A2">
      <PrelineSplitAuth
        title="Sign in to your Studio"
        subtitle="Access your production floor, manage hired agents, and review generated cuts."
        sidebarTagline="Lorem ipsum"
        sidebarHeadline="Lorem ipsum dolor sit amet consectetur"
        footer={
          <p className="text-text-muted">
            Don&apos;t have a studio yet?{" "}
            <Link href="/?auth=signup" className="text-pink hover:underline font-semibold font-mono">
              Create Studio →
            </Link>
          </p>
        }
      >
        <Suspense fallback={<div className="py-8 text-center text-text-muted font-mono">Loading authentication...</div>}>
          <AuthForm mode="login" />
        </Suspense>
      </PrelineSplitAuth>
    </section>
  );
}
