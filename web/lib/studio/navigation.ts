export type NavItem = Readonly<{
  label: string;
  href: string;
  paths?: readonly string[];
}>;

export const ROUTE_CONTRACTS = [
  ["/", "Unknown User", "public"],
  ["/studio", "Unknown User", "public"],
  ["/system", "Unknown User", "public"],
  ["/social-workshop", "Unknown User", "public"],
  ["/gallery", "Unknown User", "public"],
  ["/docs", "Unknown User", "public"],
  ["/pricing", "Unknown User", "public"],
  ["/core-values", "Unknown User", "public"],
  ["/contact", "Unknown User", "public"],
  ["/terms", "Unknown User", "public"],
  ["/privacy", "Unknown User", "public"],
  ["/signup", "Unknown User", "auth-transition"],
  ["/login", "Unknown User", "auth-transition"],
  ["/forgot-password", "Unknown User", "auth-transition"],
  ["/reset-password", "Unknown User", "auth-transition"],
  ["/verify-email", "Unknown User", "auth-transition"],
  ["/mfa", "Unknown User", "auth-transition"],
  ["/app", "Front Office", "authenticated-workspace"],
  ["/app/channels", "Front Office", "authenticated-workspace"],
  ["/app/channels/[channelId]", "Front Office", "authenticated-workspace"],
  ["/app/marketing", "Front Office", "authenticated-workspace"],
  ["/app/social", "Front Office", "authenticated-workspace"],
  ["/app/staffing", "Front Office", "authenticated-workspace"],
  ["/app/agents", "Front Office", "authenticated-workspace"],
  ["/app/onboarding", "Front Office", "authenticated-workspace"],
  ["/app/builder", "Studio", "authenticated-workspace"],
  ["/app/studio", "Studio", "authenticated-workspace"],
  ["/app/front-office", "Studio", "authenticated-workspace"],
  ["/app/productions/[productionId]", "Studio", "authenticated-workspace"],
  ["/app/assets", "Studio", "authenticated-workspace"],
  ["/app/universe", "Studio", "authenticated-workspace"],
  ["/app/universe/[id]", "Studio", "authenticated-workspace"],
  ["/app/dna", "Studio", "redirect-to-/app/universe"],
  ["/app/genplay", "Studio", "redirect-to-/app/studio"],
  ["/app/orchestration", "Studio", "authenticated-workspace"],
  ["/account", "Account", "authenticated-account-workspace"],
  ["/app/billing", "Account", "authenticated-account-workspace"],
  ["/app/integrations", "Account", "authenticated-account-workspace"],
  ["/dashboard", "Compatibility", "redirect-to-/app"],
  ["not-found", "Unknown User", "context-dependent"],
  ["error", "Unknown User", "context-dependent"],
] as const;

export type NavGroup = Readonly<{
  label: string;
  href: string;
  paths: readonly string[];
  items: readonly NavItem[];
}>;

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Front Office",
    href: "/app",
    paths: ["/app", "/app/channels", "/app/marketing", "/app/social", "/app/staffing", "/app/agents", "/app/builder"],
    items: [
      { label: "Overview", href: "/app" },
      { label: "Channels", href: "/app/channels" },
      { label: "Marketing", href: "/app/marketing" },
      { label: "Socials", href: "/app/social" },
      { label: "Staffing", href: "/app/staffing", paths: ["/app/staffing", "/app/agents", "/app/builder"] },
    ],
  },
  {
    label: "Studio",
    href: "/app/studio",
    paths: ["/app/studio", "/app/front-office", "/app/assets", "/app/productions", "/app/universe", "/app/dna", "/app/genplay", "/app/orchestration"],
    items: [
      { label: "Overview", href: "/app/studio", paths: ["/app/studio", "/app/front-office", "/app/productions"] },
      { label: "Assets", href: "/app/assets", paths: ["/app/assets", "/app/universe", "/app/dna", "/app/genplay"] },
      { label: "Orchestration", href: "/app/orchestration" },
    ],
  },
  {
    label: "Account",
    href: "/account",
    paths: ["/account", "/app/integrations", "/app/billing"],
    items: [
      { label: "Profile & Settings", href: "/account" },
      { label: "Integrations", href: "/app/integrations" },
      { label: "Billing", href: "/app/billing" },
    ],
  },
] as const;

export function pathMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
}

export function navGroupForPath(pathname: string) {
  return NAV_GROUPS.find(({ paths }) => paths.some((path) => pathMatches(pathname, path))) ?? NAV_GROUPS[0];
}

export function navItemIsActive(pathname: string, item: NavItem) {
  return (item.paths ?? [item.href]).some((path) => pathMatches(pathname, path));
}
