import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Reset password" };
export default function ForgotPasswordPage() { return <section className="form-page"><AuthForm mode="forgot" /></section>; }
