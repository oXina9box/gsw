import Link from "next/link";
export const metadata = { title: "Verify email" };
export default function VerifyEmailPage() { return <section className="form-page" data-archetype="A2"><div className="form-card"><p className="kicker">Gem Studio / account</p><h1>Check your email.</h1><p className="form-note">Use the confirmation link we sent to finish setting up your account. If you already confirmed it, continue to your workspace.</p><Link className="button button-primary" href="/app">Open workspace</Link></div></section>; }
