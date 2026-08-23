import { LegalDocument } from "@/lib/legal-document";
import { notFound } from "next/navigation";

export const metadata = { title: "Privacy" };
export const dynamic = "force-static";

export default function PrivacyPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") notFound();
  return <LegalDocument file="privacy-policy.md" />;
}
