import { NextResponse } from "next/server";
import { evaluateSignupPolicy } from "@/lib/auth/signup-boundary";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    inviteCode?: string;
    userId?: string;
    email?: string;
    password?: string;
  } | null;
  const inviteCode = body?.inviteCode?.trim() ?? request.headers.get("x-invite-code")?.trim() ?? "";
  const policy = {
    signup: (process.env.NEXT_PUBLIC_SIGNUPS_ENABLED === "false"
      ? "disabled"
      : process.env.BETA_INVITE_REQUIRED === "true"
        ? "invite_only"
        : "enabled") as "enabled" | "invite_only" | "disabled",
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
  if (body?.userId || (body?.email && body?.password)) {
    try {
      const admin = createAdminClient();
      if (body.userId) {
        await admin.auth.admin.updateUserById(body.userId, { email_confirm: true });
      } else if (body.email && body.password) {
        const { error } = await admin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
        });
        if (error && error.message.toLowerCase().includes("already registered")) {
          const { data: usersData } = await admin.auth.admin.listUsers();
          const target = usersData?.users.find((u) => u.email === body.email);
          if (target) {
            await admin.auth.admin.updateUserById(target.id, {
              email_confirm: true,
              password: body.password,
            });
          }
        }
      }
    } catch (err) {
      console.error("Auto-confirm error:", err);
    }
  }
  return NextResponse.json({ allowed: true });
}
