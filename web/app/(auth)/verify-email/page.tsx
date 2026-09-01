import Link from "next/link";
import { PrelineSplitAuth } from "@/components/blocks/preline/preline-vertical-marquee";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <section className="shell py-8" data-archetype="A2">
      <PrelineSplitAuth
        title="Verify your email"
        subtitle="We've sent a verification link to your registered email address. Follow the link to activate your production workspace."
        sidebarTagline="Lorem ipsum"
        sidebarHeadline="Lorem ipsum dolor sit amet consectetur"
        footer={
          <p className="text-text-muted">
            Didn&apos;t receive an email?{" "}
            <Link href="/login" className="text-cyan hover:underline font-semibold font-mono">
              Resend or try another address →
            </Link>
          </p>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-text-muted font-body leading-relaxed">
            If you have already confirmed your email address, you can continue directly into your studio production workspace.
          </p>
          <Link
            className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-pink hover:bg-pink/90 text-ink font-mono font-semibold text-sm transition duration-200 shadow-md"
            href="/app"
          >
            Continue to Workspace
          </Link>
        </div>
      </PrelineSplitAuth>
    </section>
  );
}
