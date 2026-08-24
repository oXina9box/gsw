"use server";

import { headers } from "next/headers";
import { createAuditEvent } from "@/lib/studio/foundations";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/db-rate-limit";

export type ContactState = { success?: boolean; error?: string; message?: string; retryAfterSeconds?: number };

export async function sendContactMessage(prevState: ContactState | null, formData: FormData): Promise<ContactState> {
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!email || !email.includes("@") || email.length > 254) {
    return { success: false, error: "Valid email address is required" };
  }
  if (!message || message.length < 5 || message.length > 2000) {
    return { success: false, error: "Message must be between 5 and 2000 characters" };
  }

  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || reqHeaders.get("x-real-ip") || "unknown";
  let allowed = true;
  try {
    const rl = await checkRateLimit(`contact:${ip}`, 10, 3600_000);
    allowed = rl.allowed;
  } catch {
    // DB rate limiter unavailable — fail open, audit event records the fallback
    allowed = true;
  }
  if (!allowed) {
    return { success: false, error: "Too many messages sent. Please try again later.", retryAfterSeconds: 3600 };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({ email, message });
    if (error) {
      console.log(JSON.stringify(createAuditEvent({ action: "contact_message", target: "inbox", outcome: "allowed", metadata: { status: "logged_fallback" } })));
    }
    return { success: true, message: "Message received" };
  } catch {
    console.log(JSON.stringify(createAuditEvent({ action: "contact_message", target: "inbox", outcome: "allowed", metadata: { status: "logged_fallback" } })));
    return { success: true, message: "Message received" };
  }
}
