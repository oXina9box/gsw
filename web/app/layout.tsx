import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Gem Studio — AI film studio", template: "%s · Gem Studio" },
  description: "A private AI film studio for channels, hired agents, human-approved production, native assembly, release planning, and signals.",
  applicationName: "Gem Studio",
  openGraph: { title: "Gem Studio — AI film studio", description: "Make the impossible feel scheduled.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Gem Studio — AI film studio", description: "Make the impossible feel scheduled." },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#030305", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body id="top">{children}</body></html>;
}
