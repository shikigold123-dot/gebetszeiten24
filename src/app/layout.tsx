import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
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
  title: { default: 'Gebetszeiten24', template: '%s | Gebetszeiten24' },
  description: 'Genaue Gebetszeiten für alle großen Städte in Deutschland.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
