import { describe, expect, it } from "vitest";

import { ROUTE_CONTRACTS } from "../../lib/studio/navigation";

describe("route contract", () => {
  it("freezes every route under the four-module sitemap", () => {
    expect(ROUTE_CONTRACTS).toEqual([
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
    ]);
  });
});
