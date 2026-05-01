import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://whatisyourconcern.com"),
  title: "what is your concern?",
  description:
    "An anonymous global record of what humanity is afraid of, right now. Add your voice. The world is listening.",
  openGraph: {
    title: "what is your concern?",
    description:
      "An anonymous global record of what humanity is afraid of, right now.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "what is your concern?",
    description: "an anonymous global record. add your voice.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
