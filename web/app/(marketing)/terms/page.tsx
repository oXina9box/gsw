import { LegalDocument } from "@/lib/legal-document";

export const metadata = { title: "Terms" };
export const dynamic = "force-static";

export default function TermsPage() {
  return <LegalDocument file="terms-of-service.md" />;
}
