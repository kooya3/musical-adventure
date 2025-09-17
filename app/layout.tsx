import type { Metadata } from "next";
import { Inter, Figtree, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import ModelProvider from "@/contexts/ModelContext";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Frontend Developer",
    "Full-Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "3D Web Development",
    "WebGL",
    "Three.js",
    "Elyees Tatua",
  ],
  authors: [
    {
      name: SITE_CONFIG.name,
    },
  ],
  creator: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${inter.variable} ${figtree.variable} ${instrumentSerif.variable} font-figtree antialiased bg-black text-white overflow-x-hidden`}
      >
        <ModelProvider autoLoad={true}>
          {children}
        </ModelProvider>
        <Analytics />
      </body>
    </html>
  );
}
