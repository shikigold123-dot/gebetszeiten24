import type { Metadata } from 'next';
import type { City } from '@/data/cities';
import { formatDateLong } from './utils';

export function cityMetadata(city: City, date: Date): Metadata {
  const dateStr = formatDateLong(date);
  const title = `Gebetszeiten ${city.name} — ${dateStr}`;
  const description = `Gebetszeiten für ${city.name} am ${dateStr}. Alle Berechnungsmethoden, Monatsansicht, werbefrei. Jetzt aktuelle Zeiten abrufen.`;
  return {
    title,
    description,
    alternates: { canonical: `/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `/${city.slug}`,
      type: 'website',
      locale: 'de_DE',
      siteName: 'Gebetszeiten24',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function placeJsonLd(city: City) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place' as const,
    name: city.name,
    address: {
      '@type': 'PostalAddress',
      addressRegion: city.state,
      addressCountry: 'DE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `https://gebetszeiten24.de${it.url}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage' as const,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
