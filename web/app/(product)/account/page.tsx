import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "@/components/auth/delete-account-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
export const metadata = { title: "Account" };
export default async function AccountPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); return <section className="product-page shell"><p className="kicker">Account</p><h1>Account settings</h1><div className="panel"><p className="muted">Signed in as</p><h2>{user?.email}</h2><div className="actions"><SignOutButton /></div></div><div className="panel danger-panel"><h2>Delete account</h2><p className="muted">This permanently removes your account and cascades workspace data. Export anything you need first.</p><DeleteAccountButton /></div></section>; }
