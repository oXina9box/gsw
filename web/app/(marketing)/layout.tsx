import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MarketingEffects } from "@/components/marketing/marketing-effects";
import { CoreA } from "@/components/templates/core-shell";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><main id="main-content"><CoreA>{children}</CoreA></main><SiteFooter /><MarketingEffects /></>;
}
