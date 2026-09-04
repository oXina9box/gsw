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
  ["/portfolio", "Unknown User", "public"],
  ["/do-not-click", "Unknown User", "public"],
  ["/docs", "Unknown User", "public"],
  ["/pricing", "Unknown User", "public"],
  ["/core-values", "Unknown User", "public"],
  ["/contact", "Unknown User", "public"],
  ["/terms", "Unknown User", "public"],
  ["/privacy", "Unknown User", "public"],
  ["/signup", "Unknown User", "redirect-to-/?auth=signup"],
  ["/login", "Unknown User", "auth-transition"],
  ["/forgot-password", "Unknown User", "auth-transition"],
  ["/reset-password", "Unknown User", "auth-transition"],
  ["/verify-email", "Unknown User", "auth-transition"],
  ["/mfa", "Unknown User", "auth-transition"],
  ["/app", "Front Office", "authenticated-workspace"],
  ["/app/channels", "Front Office", "authenticated-workspace"],
  ["/app/channels/[channelId]", "Studio", "authenticated-workspace"],
  ["/app/channels/[channelId]/staffing", "Studio", "authenticated-workspace"],
  ["/app/channels/[channelId]/marketing", "Studio", "authenticated-workspace"],
  ["/app/channels/[channelId]/social", "Studio", "authenticated-workspace"],
  ["/app/channels/[channelId]/assets", "Studio", "authenticated-workspace"],
  ["/app/channels/[channelId]/production", "Studio", "authenticated-workspace"],
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
  ["/app/collective", "Studio", "authenticated-workspace"],
  ["/app/secrets", "Studio", "authenticated-workspace"],
  ["/account", "Account", "authenticated-account-workspace"],
  ["/app/billing", "Account", "authenticated-account-workspace"],
  ["/app/integrations", "Studio", "authenticated-workspace"],
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

export const STUDIO_MODULE: NavGroup = {
  label: "Studio",
  href: "/app/collective",
  paths: ["/app", "/app/studio", "/app/front-office", "/app/assets", "/app/productions", "/app/universe", "/app/dna", "/app/genplay", "/app/orchestration", "/app/collective", "/app/secrets", "/app/integrations", "/app/channels", "/app/marketing", "/app/social", "/app/staffing", "/app/agents", "/app/builder", "/app/onboarding"],
  items: [
    { label: "Collective", href: "/app/collective" },
    { label: "Integrations", href: "/app/integrations" },
    { label: "Secrets", href: "/app/secrets" },
    { label: "Studio setup", href: "/app/onboarding" },
  ],
} as const;

export const MODULES: readonly NavGroup[] = [STUDIO_MODULE] as const;

export function pathMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`));
}

export function navGroupForPath(pathname: string) {
  return MODULES.find(({ paths }) => paths.some((path) => pathMatches(pathname, path))) ?? STUDIO_MODULE;
}

export function navItemIsActive(pathname: string, item: NavItem) {
  return (item.paths ?? [item.href]).some((path) => pathMatches(pathname, path));
}
