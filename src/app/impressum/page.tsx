import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum gemäß § 5 TMG.',
  alternates: { canonical: '/impressum' },
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs
        items={[{ label: 'Startseite', href: '/' }, { label: 'Impressum' }]}
      />
      <h1 className="mt-6 font-serif text-4xl">Impressum</h1>
      <section className="mt-6 space-y-4 text-sm">
        <p>
          <strong>Angaben gemäß § 5 TMG</strong>
        </p>
        <p>
          [Name des Betreibers]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ, Ort]
          <br />
          Deutschland
        </p>
        <p>
          <strong>Kontakt:</strong>
          <br />
          E-Mail: [E-Mail-Adresse]
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong>
          <br />
          [Name, Adresse wie oben]
        </p>
        <p className="text-[var(--color-muted)]">
          Haftungsausschluss: Trotz sorgfältiger Prüfung der Inhalte übernehmen wir
          keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der
          berechneten Gebetszeiten. Für konkrete religiöse Fragen wende dich bitte
          an die zuständige Moschee oder Gelehrten.
        </p>
      </section>
    </main>
  );
}
