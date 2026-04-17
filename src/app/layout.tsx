import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import '@/styles/globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gebetszeiten24.de'),
  title: {
    default: 'Gebetszeiten24 — Gebetszeiten für Deutschland',
    template: '%s | Gebetszeiten24',
  },
  description:
    'Genaue Gebetszeiten für alle großen Städte in Deutschland. Alle Berechnungsmethoden, Monatsansicht, werbefrei.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'de_DE', siteName: 'Gebetszeiten24' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sans.variable} ${serif.variable}`}>
      <head>
        {process.env.NODE_ENV === 'production' && (
          <script
            defer
            data-domain="gebetszeiten24.de"
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
