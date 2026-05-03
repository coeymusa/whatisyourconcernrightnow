import type { Metadata, Viewport } from "next";
import { Instrument_Serif, JetBrains_Mono, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = "https://whatisyourconcern.com";
const SITE_NAME = "what is your concern?";
const SITE_DESC =
  "An anonymous global record of what humanity is afraid of, right now. One concern per person, from anywhere in the world, owned by nobody. No replies, no metrics, no ads. The world is listening.";

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
    "what is humanity afraid of",
    "anonymous global hive mind",
    "no metrics no ads",
    "owned by nobody",
    "one concern per person",
    "anonymous voices from around the world",
    "post your fear",
    "global fears 2026",
    "anonymous social experiment",
    "concerns by country",
    "concerns by topic",
  ],
  authors: [{ name: "whatisyourconcern.com", url: SITE_URL }],
  creator: "whatisyourconcern.com",
  publisher: "whatisyourconcern.com",
  category: "society",
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/feed.xml`, title: "what is your concern? — anon dispatches" },
      ],
    },
  },
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
      sameAs: [
        "https://clowillaerts.substack.com/p/chaos-and-amazement-2618-vine-is",
      ],
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
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/topics/{search_term_string}`,
        "query-input": "required name=search_term_string",
      },
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
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is whatisyourconcern.com?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An anonymous global record of what humanity is afraid of, right now. One concern per person, from anywhere in the world, owned by nobody. No replies, no metrics, no ads.",
          },
        },
        {
          "@type": "Question",
          name: "Is it really anonymous?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. There are no accounts, no names, no logins. The site does not track contributors. An IP hash is used only for spam rate-limiting and is not linked to a profile.",
          },
        },
        {
          "@type": "Question",
          name: "What can I post?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "One concern. One sentence in your own words about something you are genuinely worried, afraid, or anxious about — economic, climate, war, democracy, loneliness, AI, the future, anything.",
          },
        },
        {
          "@type": "Question",
          name: "Can I delete or edit my entry?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The record cannot be edited and cannot be censored. Once a voice is on the record it stays on the record. That is the point.",
          },
        },
        {
          "@type": "Question",
          name: "How are concerns translated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "English by default. When the original is in another language, the original is preserved and shown beneath the English version in muted monospace.",
          },
        },
        {
          "@type": "Question",
          name: "Can I share an entry?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Every entry has a permanent shareable URL at /dispatch/<id>. You can also browse by country at /world or by topic at /topics.",
          },
        },
      ],
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
