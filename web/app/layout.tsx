import type { Metadata, Viewport } from "next";
import { DM_Mono, Space_Grotesk, Syne } from 'next/font/google';
import "./globals.css";

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const syne = Syne({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app'),
  title: { default: "Gem Studio — AI film studio", template: "%s · Gem Studio" },
  description: "A private AI film studio for channels, hired agents, human-approved production, native assembly, release planning, and signals.",
  applicationName: "Gem Studio",
  openGraph: { title: "Gem Studio — AI film studio", description: "Make the impossible feel scheduled.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Gem Studio — AI film studio", description: "Make the impossible feel scheduled." },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#030305", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${dmMono.variable} ${spaceGrotesk.variable} ${syne.variable}`}><body id="top"><a href="#main-content" className="skip-link">Skip to main content</a>{children}</body></html>;
}
