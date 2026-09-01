import { notFound } from "next/navigation";
import { LegalDocument } from "@/lib/legal-document";
export const metadata = { title: "Privacy" };
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") {
    notFound();
  }
  return <LegalDocument file="privacy-policy.md" label="Legal / Privacy Policy" />;
}
