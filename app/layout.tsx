import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>tzc - time zone converter</title>
        <meta
          name="description"
          content="interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles. automatically convert timezone mentions in slack messages!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  );
}

export const metadata = {
  title: 'tzc - time zone converter',
  description:
    'interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles. automatically convert timezone mentions in slack messages!',
  generator: 'v0.dev',
  keywords: [
    'timezone',
    'time zone',
    'converter',
    'slack',
    'bot',
    'visualization',
    'gradient',
    'world clock',
  ],
  authors: [{ name: 'bartosz jarocki' }],
  creator: 'bartosz jarocki',
  openGraph: {
    title: 'tzc - time zone converter',
    description:
      'interactive visualization of world time zones with draggable interface and gradient background representing day/night cycles',
    url: 'https://tzc.app',
    siteName: 'tzc',
    type: 'website',
    images: [
      {
        url: '/assets/screenshot.png',
        width: 1200,
        height: 630,
        alt: 'timezone visualization with gradient day/night cycle',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tzc - time zone converter',
    description: 'interactive visualization of world time zones with slack integration',
    images: ['/assets/screenshot.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
