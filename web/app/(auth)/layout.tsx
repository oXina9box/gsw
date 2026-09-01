import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { CoreA } from "@/components/templates/core-shell";
import { MarketingEffects } from "@/components/marketing/marketing-effects";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><main id="main-content"><CoreA>{children}</CoreA></main><SiteFooter /><MarketingEffects /></>;
}
