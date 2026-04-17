import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { CitySearch } from '@/components/city-search';
import { CityCard } from '@/components/city-card';
import { formatDateLong } from '@/lib/utils';
import { formatHijri } from '@/lib/hijri';

export const metadata: Metadata = {
  title: 'Gebetszeiten24 — Gebetszeiten für alle Städte in Deutschland',
  description:
    'Genaue Gebetszeiten für die 100 größten Städte Deutschlands. Alle Berechnungsmethoden, Monatsansicht, werbefrei und DSGVO-konform.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const today = new Date();
  const featured = cities.slice(0, 12);

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 text-sage opacity-[0.04]"
        aria-hidden
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'url(/pattern.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '160px',
          }}
        />
      </div>

      <section className="relative text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Gebetszeiten für Deutschland
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
          Gebetszeiten für deine Stadt —<br />
          präzise, werbefrei, DSGVO-konform.
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          {formatDateLong(today)} · {formatHijri(today)}
        </p>
      </section>

      <section className="relative mt-10">
        <CitySearch />
      </section>

      <section className="relative mt-16">
        <h2 className="font-serif text-2xl">Beliebte Städte</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CityCard key={c.slug} city={c} />
          ))}
        </div>
      </section>

      <section className="relative mt-16 rounded-3xl border border-[var(--color-border)] p-8 text-[var(--color-muted)]">
        <h2 className="font-serif text-2xl text-[var(--color-foreground)]">
          Über Gebetszeiten24
        </h2>
        <p className="mt-4">
          Gebetszeiten24 berechnet die fünf täglichen Gebetszeiten nach
          astronomischen Verfahren und deckt alle in Deutschland gebräuchlichen
          Methoden ab — darunter Muslim World League, Diyanet (Türkei), Ägyptische
          Behörde, ISNA und weitere. Für jede Stadt erhältst du Fajr,
          Sonnenaufgang, Dhuhr, Asr, Maghrib und Isha in Ortszeit.
        </p>
        <p className="mt-4">
          Die Berechnung erfolgt vollständig transparent mit der
          Open-Source-Bibliothek adhan. Wir zeigen keine Werbung, setzen keine
          Tracking-Cookies und arbeiten DSGVO-konform.
        </p>
      </section>
    </main>
  );
}
