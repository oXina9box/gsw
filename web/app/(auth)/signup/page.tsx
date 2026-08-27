import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Create account" };
export default function SignupPage() { return <section className="form-page" data-archetype="A2"><Suspense><AuthForm mode="signup" /></Suspense></section>; }
