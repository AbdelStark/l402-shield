import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "L402 Shield - Lightning Payments Demo",
  description:
    "A retro arcade-style demo of the L402 Lightning HTTP 402 Protocol",
};

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
      </head>
      <body className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
      </body>
    </html>
  );
}
