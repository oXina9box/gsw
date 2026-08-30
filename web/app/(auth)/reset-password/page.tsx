"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { PrelineSplitAuth } from "@/components/blocks/preline/preline-vertical-marquee";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Password updated.");
    setTimeout(() => router.replace("/app"), 500);
  }

  return (
    <section className="shell py-8" data-archetype="A2">
      <PrelineSplitAuth
        title="Reset your password"
        subtitle="Set a new secure password of at least 8 characters for your studio account."
        sidebarTagline="Security Recovery"
        sidebarHeadline="Encrypted credentials and isolated workspace protection"
        footer={
          <p className="text-text-muted">
            Remembered your credentials?{" "}
            <Link href="/login" className="text-cyan hover:underline font-semibold font-mono">
              Back to Sign in →
            </Link>
          </p>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block font-mono text-xs text-text-muted uppercase tracking-wider">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              minLength={8}
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 border border-border bg-bg text-text rounded-xl text-sm font-body focus:border-cyan focus:outline-none"
            />
          </div>
          <button className="w-full py-3 px-4 rounded-xl bg-pink hover:bg-pink/90 text-ink font-mono font-semibold text-sm transition duration-200 shadow-md" type="submit">
            Update Password
          </button>
        </form>
        {error && <p className="form-error mt-4 text-red text-sm font-body" role="alert">{error}</p>}
        {message && <p className="form-note text-lime text-xs font-mono mt-4" role="status">{message}</p>}
      </PrelineSplitAuth>
    </section>
  );
}
