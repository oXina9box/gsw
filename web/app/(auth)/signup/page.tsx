import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Create account" };
export default function SignupPage() { return <section className="form-page"><AuthForm mode="signup" /></section>; }
