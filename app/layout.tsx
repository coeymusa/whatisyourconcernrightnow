import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://whatisyourconcern.com"),
  title: "what is your concern?",
  description:
    "An anonymous global record of what humanity is afraid of, right now. Add your voice. The world is listening.",
  keywords: [
    "anonymous",
    "global record",
    "concerns",
    "voices",
    "world map",
    "3D globe",
    "humanity",
    "social experiment",
    "climate",
    "democracy",
    "loneliness",
    "future",
    "post anonymously",
  ],
  authors: [{ name: "whatisyourconcern.com" }],
  alternates: { canonical: "/" },
  applicationName: "what is your concern?",
  openGraph: {
    title: "what is your concern?",
    description:
      "An anonymous global record of what humanity is afraid of, right now.",
    type: "website",
    url: "https://whatisyourconcern.com",
    siteName: "what is your concern?",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "what is your concern?",
    description: "an anonymous global record. add your voice.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* JSON-LD: helps Google's knowledge panel + rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "what is your concern?",
              alternateName: "whatisyourconcern.com",
              url: "https://whatisyourconcern.com",
              description:
                "An anonymous global record of what humanity is afraid of, right now.",
              inLanguage: "en",
              publisher: {
                "@type": "Organization",
                name: "what is your concern?",
                url: "https://whatisyourconcern.com",
              },
            }),
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
