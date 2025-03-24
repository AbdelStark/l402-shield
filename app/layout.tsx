import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  title: "L402 Shield - Lightning Payments on Bitcoin",
  description:
    "A retro arcade-style demo of the L402 Lightning HTTP 402 Protocol for Bitcoin micropayments. Accept Bitcoin payments for your API with L402.",
  applicationName: "L402 Shield",
  authors: [{ name: "AbdelStark", url: "https://github.com/AbdelStark" }],
  keywords: [
    "Bitcoin",
    "Lightning Network",
    "L402",
    "HTTP 402",
    "micropayments",
    "API monetization",
    "web monetization",
    "Bitcoin payments",
    "Lightning payments",
    "Nostr"
  ],
  creator: "AbdelStark",
  publisher: "AbdelStark",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://l402.starknetonbitcoin.com/",
    title: "L402 Shield - Lightning Payments on Bitcoin",
    description: "A retro arcade-style demo of the L402 Lightning HTTP 402 Protocol for Bitcoin micropayments",
    siteName: "L402 Shield",
    images: [
      {
        url: "https://l402.starknetonbitcoin.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "L402 Shield - Lightning Payments on Bitcoin"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "L402 Shield - Lightning Payments on Bitcoin",
    description: "A retro arcade-style demo of the L402 Lightning HTTP 402 Protocol for Bitcoin micropayments",
    creator: "@AbdelStark",
    images: ["https://l402.starknetonbitcoin.com/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

export const viewport: Viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en"
      style={{
        "--bc-color-brand": "#a855f7",
        "--bc-color-brand-dark": "#c084fc",
        "--bc-brand-mix": "100%",
        "--bc-color-brand-button-text": "#ffffff",
        "--bc-color-brand-button-text-dark": "#ffffff"
      } as any}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        {/* Fonts for Bitcoin Connect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Canonical URL */}
        <link rel="canonical" href="https://l402.starknetonbitcoin.com/" />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
