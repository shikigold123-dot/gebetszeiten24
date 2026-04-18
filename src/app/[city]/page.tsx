import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { findCityBySlug, findNearbyCities } from '@/lib/cities';
import { stateSlugMap } from '@/lib/states';
import { computePrayerTimes } from '@/lib/adhan';
import { cityMetadata, placeJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { formatDateLong, formatTime } from '@/lib/utils';
import { formatHijri } from '@/lib/hijri';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PrayerTimesTable } from '@/components/prayer-times-table';
import { NextPrayerCard } from '@/components/next-prayer-card';
import { MethodSelector } from '@/components/method-selector';
import { FaqAccordion, cityFaqs } from '@/components/faq-accordion';
import { JsonLd } from '@/components/json-ld';

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
  return cityMetadata(city, new Date());
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) notFound();

  const date = new Date();
  const { times } = computePrayerTimes({
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    method: 'MWL',
    madhab: 'Shafi',
    date,
  });
  const initialTimes = {
    fajr: formatTime(times.fajr),
    sunrise: formatTime(times.sunrise),
    dhuhr: formatTime(times.dhuhr),
    asr: formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isha: formatTime(times.isha),
  };

  const nearby = findNearbyCities(city, 5);
  const faqs = cityFaqs(city);

  const ld = [
    placeJsonLd(city),
    breadcrumbJsonLd([
      { name: 'Startseite', url: '/' },
      { name: city.name, url: `/${city.slug}` },
    ]),
    faqJsonLd(faqs),
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <JsonLd data={ld} />

      <Breadcrumbs
        items={[{ label: 'Startseite', href: '/' }, { label: city.name }]}
      />

      <header className="mt-6">
        <h1 className="font-serif text-4xl sm:text-5xl">
          Gebetszeiten in {city.name}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Heute, {formatDateLong(date)} · {formatHijri(date)}
        </p>
      </header>

      <section className="mt-8">
        <NextPrayerCard city={city} />
      </section>

      <section className="mt-8">
        <PrayerTimesTable
          city={city}
          initialTimes={initialTimes}
          initialDate={date.toISOString()}
        />
        <div className="mt-4">
          <MethodSelector />
        </div>
        <div className="mt-6">
          <Link
            href={`/${city.slug}/monat`}
            className="text-sage underline-offset-4 hover:underline"
          >
            Monatsansicht für {city.name} →
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[var(--color-border)] p-6 text-sm text-[var(--color-muted)]">
        <p>
          {city.name} ist eine{' '}
          {city.population >= 500_000
            ? 'Großstadt'
            : city.population >= 100_000
              ? 'Großstadt'
              : 'Stadt'}{' '}
          in{' '}
          <Link
            href={`/bundesland/${stateSlugMap[city.state]}`}
            className="text-sage underline-offset-2 hover:underline"
          >
            {city.state}
          </Link>{' '}
          mit rund {city.population.toLocaleString('de-DE')} Einwohnern und
          einer geschätzten muslimischen Gemeinschaft von etwa{' '}
          {Math.round((city.population * 0.055) / 1000) * 1000 >= 1000
            ? `${(Math.round((city.population * 0.055) / 1000) * 1000).toLocaleString('de-DE')} Personen`
            : 'einigen Hundert Personen'}
          . Die Gebetszeiten werden täglich neu berechnet — auf Basis der
          geographischen Koordinaten ({city.lat.toFixed(3)}°N,{' '}
          {city.lng.toFixed(3)}°E) und astronomischer Algorithmen.{' '}
          {city.lat > 51
            ? `Da ${city.name} nördlich des 51. Breitengrades liegt, können die Gebetszeiten im Sommer besonders stark variieren — Isha fällt in Hochsommernächten erst spät ein.`
            : `Die Lage in Süd- bzw. Mitteldeutschland sorgt für vergleichsweise stabile Gebetszeiten im Jahresverlauf.`}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Häufige Fragen</h2>
        <div className="mt-4">
          <FaqAccordion city={city} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Gebetszeiten in der Nähe</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {nearby.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="block rounded-2xl border border-[var(--color-border)] p-4 hover:border-sage"
              >
                <span className="font-serif text-lg">{c.name}</span>
                <span className="block text-xs text-[var(--color-muted)]">
                  {c.state}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
