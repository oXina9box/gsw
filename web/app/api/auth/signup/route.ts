import { NextResponse } from "next/server";
import { evaluateSignupPolicy } from "@/lib/auth/signup-boundary";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { inviteCode?: string } | null;
  const inviteCode = body?.inviteCode?.trim() ?? request.headers.get("x-invite-code")?.trim() ?? "";
  const policy = {
    signup: (process.env.NEXT_PUBLIC_SIGNUPS_ENABLED === "true"
      ? "enabled"
      : process.env.BETA_INVITE_REQUIRED === "true"
        ? "invite_only"
        : "disabled") as "enabled" | "invite_only" | "disabled",
    maintenance: process.env.MAINTENANCE === "true",
  };
  const hasInvite = Boolean(inviteCode);
  const decision = evaluateSignupPolicy(policy, hasInvite);
  if (!decision.allowed) {
    const status = decision.reason === "invite_required" ? 403 : 503;
    return NextResponse.json({ error: decision.reason }, { status });
  }
  if (policy.signup === "invite_only") {
    const admin = createAdminClient();
    const { data: invite } = await admin
      .from("beta_invites")
      .select("id")
      .eq("code", inviteCode)
      .eq("consumed", false)
      .maybeSingle();
    if (!invite) return NextResponse.json({ error: "invite_required" }, { status: 403 });
  }
  return NextResponse.json({ allowed: true });
}
