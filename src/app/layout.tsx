import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Readiness Assessment | Inna Kashtanova",
  description: "Evaluate your organization's AI maturity and get a high-impact roadmap in 2 minutes. Managed by Inna Kashtanova.",
  
  openGraph: {
    title: "AI Readiness Assessment | Inna Kashtanova",
    description: "High-impact AI roadmap for the Canadian & Global market in 2 minutes.",
    url: "https://ai-readiness-assessment-pi.vercel.app/",
    siteName: "Inna Kashtanova AI",
    images: [
      {
        url: "/opengraph-image.png", 
        width: 1200,
        height: 630,
        alt: "AI Readiness Assessment Roadmap",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI Readiness Assessment | Inna Kashtanova",
    description: "Evaluate your organizational AI maturity in 2 minutes.",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  
  manifest: "/site.webmanifest",
  
  appleWebApp: {
    title: "AI Assessment",
    statusBarStyle: "default",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics /> {/* <--- Add Analytics */}
      </body>
    </html>
  );
}