"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { PrelineLoginCard } from "@/components/blocks/preline/preline-login-card";

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
    <section className="form-page shell py-12" data-archetype="A2">
      <PrelineLoginCard
        kicker="Gem Studio / account"
        title="Choose a new password."
        subtitle="Set a secure password of at least 8 characters."
      >
        <form onSubmit={submit} className="stack-form">
          <div className="space-y-1">
            <label htmlFor="new-password" className="block font-mono text-xs text-text-muted uppercase tracking-wider">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 border border-border bg-bg text-text rounded-sm text-sm font-body focus:border-cyan focus:outline-none"
            />
          </div>
          <button className="button button-primary w-full mt-4" type="submit">
            Update password
          </button>
        </form>
        {error && <p className="form-error mt-3" role="alert">{error}</p>}
        {message && <p className="form-note text-lime text-xs font-mono mt-3" role="status">{message}</p>}
      </PrelineLoginCard>
    </section>
  );
}
