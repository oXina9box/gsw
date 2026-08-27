import { LegalDocument } from "@/lib/legal-document";

export const metadata = { title: "Privacy" };
export const dynamic = "force-static";

export default function PrivacyPage() {
  return <LegalDocument file="privacy-policy.md" />;
}
