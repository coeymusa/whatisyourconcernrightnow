import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteFooter from "./components/SiteFooter";

const SITE_URL = "https://whatisyourconcern.com";
const SITE_NAME = "what is your concern?";
const SITE_DESC =
  "An anonymous global record of what humanity is afraid of, right now. Add your voice. The world is listening.";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s · what is your concern?",
  },
  description: SITE_DESC,
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
    "anonymous confession",
    "what are people afraid of",
  ],
  authors: [{ name: "whatisyourconcern.com", url: SITE_URL }],
  creator: "whatisyourconcern.com",
  publisher: "whatisyourconcern.com",
  category: "society",
  alternates: { canonical: SITE_URL },
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: SITE_NAME,
    description:
      "An anonymous global record of what humanity is afraid of, right now.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "what is your concern? — an anonymous global record",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "an anonymous global record. add your voice.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1ece2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0908" },
  ],
  colorScheme: "dark light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon`,
        width: 96,
        height: 96,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      name: SITE_NAME,
      alternateName: "whatisyourconcern.com",
      url: SITE_URL,
      description: SITE_DESC,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern browser.",
      description:
        "Browse and post anonymous concerns from people around the world on an interactive 3D globe. No accounts, no names, no tracking of contributors.",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Anonymous posting",
        "Interactive 3D globe of concerns",
        "Filter by country, age, and topic",
        "Respond to others' concerns",
      ],
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable} ${geist.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
