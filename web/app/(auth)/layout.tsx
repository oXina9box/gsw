import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MobileMenuController } from "@/components/shell/mobile-menu";
import { CoreA } from "@/components/templates/core-shell";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><MobileMenuController /><main id="main-content"><CoreA>{children}</CoreA></main><SiteFooter /></>;
}
