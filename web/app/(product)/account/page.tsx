import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
export const metadata = { title: "Account" };
export default async function AccountPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); return <section className="product-page shell"><p className="kicker">Account</p><h1>Account settings</h1><div className="panel"><p className="muted">Signed in as</p><h2>{user?.email}</h2><div className="actions"><SignOutButton /></div></div></section>; }
