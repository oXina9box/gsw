import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Reset password" };
export default function ForgotPasswordPage() { return <section className="form-page" data-archetype="A2"><Suspense><AuthForm mode="forgot" /></Suspense></section>; }
