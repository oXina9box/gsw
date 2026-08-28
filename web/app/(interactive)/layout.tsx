import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { CoreB } from "@/components/templates/core-shell";

export default function InteractiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><SiteHeader /><main id="main-content"><CoreB>{children}</CoreB></main><SiteFooter /></>;
}
