import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Sign in" };
export default function LoginPage() { return <section className="form-page"><Suspense><AuthForm mode="login" /></Suspense></section>; }
