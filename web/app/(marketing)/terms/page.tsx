import { LegalDocument } from "@/lib/legal-document";
import { notFound } from "next/navigation";

export const metadata = { title: "Terms" };
export const dynamic = "force-static";

export default function TermsPage() {
  if (process.env.SITE_CONTENT_APPROVED !== "true") notFound();
  return <LegalDocument file="terms-of-service.md" />;
}
