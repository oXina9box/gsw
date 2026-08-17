import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MobileMenuController } from "@/components/shell/mobile-menu";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");
  return <><SiteHeader /><MobileMenuController /><main>{children}</main><SiteFooter /></>;
}
