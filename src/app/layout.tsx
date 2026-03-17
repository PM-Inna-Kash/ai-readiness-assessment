import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Professional Metadata for the AI Readiness Assessment project
export const metadata: Metadata = {
  title: "AI Readiness Assessment | Inna Kashtanova",
  description: "High-impact AI roadmap for the Canadian & Global market in 2 minutes.",
  
  // OpenGraph Metadata (Used by Telegram, LinkedIn, WhatsApp, etc.)
  openGraph: {
    title: "AI Readiness Assessment | Inna Kashtanova",
    description: "High-impact AI roadmap for the Canadian & Global market.",
    url: "https://ai-readiness-assessment-pi.vercel.app/",
    siteName: "Inna Kashtanova AI",
    images: [
      {
        url: "/opengraph-image.png", // Ensure your lighthouse image is named exactly this in the /public folder
        width: 1200,
        height: 630,
        alt: "AI Readiness Assessment Lighthouse",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter/X Metadata
  twitter: {
    card: "summary_large_image",
    title: "AI Readiness Assessment | Inna Kashtanova",
    description: "Evaluate your organizational AI maturity in 2 minutes.",
    images: ["/opengraph-image.png"],
  },

  // Favicon and Icon configuration
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  // Web Manifest for Android/PWA support
  manifest: "/site.webmanifest",
  
  // iOS specific settings
  appleWebApp: {
    title: "AI Assessment",
    statusBarStyle: "default",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}