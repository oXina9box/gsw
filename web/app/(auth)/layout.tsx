import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { MobileMenuController } from "@/components/shell/mobile-menu";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><MobileMenuController /><main id="main-content">{children}</main><SiteFooter /></>;
}
