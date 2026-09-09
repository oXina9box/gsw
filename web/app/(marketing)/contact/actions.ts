"use server";

import { headers } from "next/headers";
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
  let allowed = false;
  try {
    const rl = await checkRateLimit(`contact:${ip}`, 10, 3600_000);
    allowed = rl.allowed;
  } catch (err) {
    console.error("Rate limiter failure for contact submission:", err);
    allowed = false;
  }
  if (!allowed) {
    return { success: false, error: "Service temporarily busy or rate limit exceeded. Please try again later.", retryAfterSeconds: 3600 };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("contact_messages").insert({ email, message });
    if (error) {
      console.error("Failed to persist contact message:", error);
      return { success: false, error: "Unable to deliver message right now. Please try again." };
    }
    return { success: true, message: "Message received" };
  } catch (err) {
    console.error("Contact message submission error:", err);
    return { success: false, error: "Unable to deliver message right now. Please try again." };
  }
}
