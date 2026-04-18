import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { allStates, stateNameFromSlug, getCitiesInState } from '@/lib/states';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return allStates.map((s) => ({ state: s.slug }));
}

type Params = { state: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const stateName = stateNameFromSlug[slug];
  if (!stateName) return {};
  const cities = getCitiesInState(stateName);
  const topCity = cities[0]?.name ?? stateName;
  return {
    title: `Gebetszeiten ${stateName}`,
    description: `Gebetszeiten für alle großen Städte in ${stateName}: ${cities
      .slice(0, 5)
      .map((c) => c.name)
      .join(', ')} und mehr. Täglich aktuell berechnet.`,
    alternates: { canonical: `/bundesland/${slug}` },
    openGraph: {
      title: `Gebetszeiten ${stateName} — Alle Städte`,
      description: `Fajr, Dhuhr, Asr, Maghrib und Isha für ${topCity} und alle weiteren Städte in ${stateName}.`,
    },
  };
}

export default async function StatePage({ params }: { params: Promise<Params> }) {
  const { state: slug } = await params;
  const stateName = stateNameFromSlug[slug];
  if (!stateName) notFound();

  const cities = getCitiesInState(stateName);
  if (cities.length === 0) notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://gebetszeiten24.de/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: stateName,
        item: `https://gebetszeiten24.de/bundesland/${slug}`,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs
        items={[{ label: 'Startseite', href: '/' }, { label: stateName }]}
      />
      <header className="mt-6">
        <h1 className="font-serif text-4xl">Gebetszeiten in {stateName}</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Alle {cities.length} Städte in {stateName} — wähle deine Stadt für tagesaktuelle Gebetszeiten.
        </p>
      </header>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/${city.slug}`}
            className="group flex flex-col rounded-2xl border border-[var(--color-border)] p-4 transition-colors hover:border-sage hover:bg-sage/5"
          >
            <span className="font-serif text-lg group-hover:text-sage">{city.name}</span>
            <span className="mt-1 text-xs text-[var(--color-muted)]">
              {city.population.toLocaleString('de-DE')} Einwohner
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-3xl border border-[var(--color-border)] p-6 text-sm text-[var(--color-muted)]">
        <p>
          Die Gebetszeiten für alle Städte in {stateName} werden täglich neu berechnet — auf Basis
          astronomischer Algorithmen und den genauen Koordinaten jeder Stadt. Standard ist die
          Muslim World League (MWL)-Methode, die in Deutschland weit verbreitet ist.
        </p>
      </section>
    </main>
  );
}
