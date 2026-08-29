import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { config } from "@/lib/config";
import { env } from "@/lib/env";
import "./globals.css";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: `${config.business.name} | Book Now`,
  description: `${config.copy.hero.tagline} Book your appointment at ${config.business.name} in Chicago.`,
  openGraph: {
    title: config.business.name,
    description: config.copy.hero.tagline,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
