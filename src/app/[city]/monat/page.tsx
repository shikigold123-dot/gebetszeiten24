import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { findCityBySlug } from '@/lib/cities';
import { computeMonth } from '@/lib/adhan';
import { formatTime } from '@/lib/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

type Params = { city: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) return {};
  const now = new Date();
  const monthName = new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
  }).format(now);
  return {
    title: `Gebetszeiten ${city.name} — ${monthName} Monatsansicht`,
    description: `Alle Gebetszeiten für ${city.name} im Monat ${monthName}. Druckbare Monatsübersicht mit Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib und Isha.`,
    alternates: { canonical: `/${city.slug}/monat` },
    robots: { index: false, follow: true },
  };
}

export default async function MonthPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) notFound();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
  }).format(now);

  const days = computeMonth({
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    method: 'MWL',
    madhab: 'Shafi',
    year,
    month,
  });

  const ld = breadcrumbJsonLd([
    { name: 'Startseite', url: '/' },
    { name: city.name, url: `/${city.slug}` },
    { name: 'Monatsansicht', url: `/${city.slug}/monat` },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <JsonLd data={ld} />
      <Breadcrumbs
        items={[
          { label: 'Startseite', href: '/' },
          { label: city.name, href: `/${city.slug}` },
          { label: 'Monatsansicht' },
        ]}
      />

      <header className="mt-6">
        <h1 className="font-serif text-4xl">Gebetszeiten {city.name}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{monthName}</p>
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left">
              <th className="py-2 pr-3">Tag</th>
              <th className="py-2 pr-3">Fajr</th>
              <th className="py-2 pr-3">Sonnenaufgang</th>
              <th className="py-2 pr-3">Dhuhr</th>
              <th className="py-2 pr-3">Asr</th>
              <th className="py-2 pr-3">Maghrib</th>
              <th className="py-2 pr-3">Isha</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {days.map((d) => (
              <tr key={d.day} className="border-b border-[var(--color-border)]/60">
                <td className="py-2 pr-3 font-sans">{d.day}.</td>
                <td className="py-2 pr-3">{formatTime(d.times.fajr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.sunrise)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.dhuhr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.asr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.maghrib)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.isha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Berechnet mit Muslim World League (MWL), Madhab Shafi.{' '}
        <Link
          className="text-sage underline-offset-4 hover:underline"
          href={`/${city.slug}`}
        >
          Zurück zu {city.name}
        </Link>
      </p>
    </main>
  );
}
