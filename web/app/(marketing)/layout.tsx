import { Suspense } from "react";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MarketingEffects } from "@/components/marketing/marketing-effects";
import { CoreA } from "@/components/templates/core-shell";
import { AuthModal } from "@/components/auth/auth-modal";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><main id="main-content" className="pt-20 sm:pt-24"><CoreA>{children}</CoreA></main><SiteFooter /><MarketingEffects /><Suspense fallback={null}><AuthModal /></Suspense></>;
}
