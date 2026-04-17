import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung für Gebetszeiten24.',
  alternates: { canonical: '/datenschutz' },
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs
        items={[{ label: 'Startseite', href: '/' }, { label: 'Datenschutz' }]}
      />
      <h1 className="mt-6 font-serif text-4xl">Datenschutzerklärung</h1>
      <section className="mt-6 space-y-4 text-sm">
        <h2 className="font-serif text-xl">1. Verarbeitete Daten</h2>
        <p>
          Beim Aufruf dieser Website werden durch den Hosting-Provider Server-Logs
          erstellt (IP-Adresse, Zeitpunkt, aufgerufene Seite, User-Agent). Diese
          Daten werden ausschließlich zur Gewährleistung eines sicheren Betriebs
          verarbeitet und nach 7 Tagen gelöscht.
        </p>
        <h2 className="font-serif text-xl">2. Cookies</h2>
        <p>
          Wir verwenden keine Tracking-Cookies. Deine Einstellungen (gewählte
          Berechnungsmethode, Farbschema) werden ausschließlich lokal in deinem
          Browser (localStorage) gespeichert und nicht an uns übertragen.
        </p>
        <h2 className="font-serif text-xl">3. Analyse</h2>
        <p>
          Für Reichweitenmessung setzen wir Plausible Analytics ein — ein
          DSGVO-konformes Werkzeug, das keine personenbezogenen Daten, keine Cookies
          und kein Cross-Site-Tracking verwendet.
        </p>
        <h2 className="font-serif text-xl">4. Rechte der Nutzer</h2>
        <p>
          Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und
          Einschränkung der Verarbeitung deiner personenbezogenen Daten. Wende dich
          hierfür an die im Impressum angegebene E-Mail-Adresse.
        </p>
      </section>
    </main>
  );
}
