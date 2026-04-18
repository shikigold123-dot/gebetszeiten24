import type { Metadata } from 'next';
import { prayerMethods, DEFAULT_METHOD } from '@/lib/prayer-methods';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Berechnungsmethoden für Gebetszeiten',
  description:
    'Überblick über alle 13 Methoden zur Berechnung der Gebetszeiten: MWL, ISNA, Diyanet, Umm al-Qura und mehr. Inklusive Fajr- und Isha-Winkel.',
  alternates: { canonical: '/berechnungsmethoden' },
};

export default function MethodsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs
        items={[
          { label: 'Startseite', href: '/' },
          { label: 'Berechnungsmethoden' },
        ]}
      />
      <header className="mt-6">
        <h1 className="font-serif text-4xl">Berechnungsmethoden für Gebetszeiten</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Die Gebetszeiten hängen von der gewählten Methode ab — vor allem die Fajr-
          und Isha-Winkel variieren. Unten findest du eine Übersicht aller 13
          unterstützten Methoden.
        </p>
      </header>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {prayerMethods.map((m) => (
          <Card key={m.key}>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl">{m.label}</h2>
              {m.key === DEFAULT_METHOD && (
                <span className="rounded-full bg-sage px-2 py-0.5 text-xs text-cream">
                  Empfohlen
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{m.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-[var(--color-muted)]">Fajr-Winkel</dt>
              <dd className="font-mono">{m.fajrAngle}°</dd>
              <dt className="text-[var(--color-muted)]">Isha-Winkel</dt>
              <dd className="font-mono">
                {m.ishaAngle === 0 ? '90 Min nach Maghrib' : `${m.ishaAngle}°`}
              </dd>
            </dl>
          </Card>
        ))}
      </div>
    </main>
  );
}
