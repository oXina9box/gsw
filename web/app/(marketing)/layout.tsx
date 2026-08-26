import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MarketingEffects } from "@/components/marketing/marketing-effects";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><main id="main-content">{children}</main><SiteFooter /><MarketingEffects /></>;
}
