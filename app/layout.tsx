import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>TZC - Time Zone Converter</title>
        <meta name="description" content="Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  );
}

export const metadata = {
  title: "TZC - Time Zone Converter",
  description: "Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles.",
  generator: "v0.dev",
  openGraph: {
    title: "TZC - Time Zone Converter",
    description: "Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles.",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TZC - Time Zone Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TZC - Time Zone Converter",
    description: "Interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles.",
    images: ["/opengraph-image"],
  },
};
