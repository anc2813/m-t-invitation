import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

/* Elegant serif font well-suited to a romantic / invitation-style experience */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'A Little Surprise',
  description: 'An invitation, just for you.',
  // Prevents search engines from indexing what is meant to be a private/personal page
  robots: { index: false, follow: false },
};

/* Locks the viewport so the experience always feels "full-screen" and
   prevents pinch-zoom from breaking the intentional full-bleed layouts */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}