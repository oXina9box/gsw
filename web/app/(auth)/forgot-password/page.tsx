import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { PrelineSplitAuth } from "@/components/blocks/preline/preline-vertical-marquee";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <section className="shell py-8" data-archetype="A2">
      <PrelineSplitAuth
        title="Reset your password"
        subtitle="Enter the email address associated with your studio to receive reset instructions."
        sidebarTagline="Lorem ipsum"
        sidebarHeadline="Lorem ipsum dolor sit amet consectetur"
        footer={
          <p className="text-text-muted">
            Remembered your password?{" "}
            <Link href="/login" className="text-cyan hover:underline font-semibold font-mono">
              Sign in →
            </Link>
          </p>
        }
      >
        <Suspense fallback={<div className="py-8 text-center text-text-muted font-mono">Loading form...</div>}>
          <AuthForm mode="forgot" />
        </Suspense>
      </PrelineSplitAuth>
    </section>
  );
}
