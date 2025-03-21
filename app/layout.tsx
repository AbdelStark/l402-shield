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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">{children}</div>
      </body>
    </html>
  );
}
