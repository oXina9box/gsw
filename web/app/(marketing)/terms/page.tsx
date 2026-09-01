import { notFound } from "next/navigation";
import { LegalDocument } from "@/lib/legal-document";
export const metadata = { title: "Terms" };
export const dynamic = "force-dynamic";

export default function TermsPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") {
    notFound();
  }
  return <LegalDocument file="terms-of-service.md" label="Legal / Terms of Service" />;
}
