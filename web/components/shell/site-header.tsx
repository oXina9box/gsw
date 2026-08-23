import { createClient } from "@/lib/supabase/server";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  let user = null;
  try {
    const supabase = await createClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    // Public pages remain renderable before environment configuration exists.
  }
  return <SiteHeaderClient authenticated={Boolean(user)} userEmail={user?.email} />;
}
