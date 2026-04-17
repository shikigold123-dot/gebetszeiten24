import type { MetadataRoute } from 'next';
import { cities } from '@/data/cities';

const BASE = 'https://gebetszeiten24.de';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${BASE}/berechnungsmethoden`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
  const cityRoutes: MetadataRoute.Sitemap = cities.flatMap((c) => [
    { url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${BASE}/${c.slug}/monat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]);
  return [...staticRoutes, ...cityRoutes];
}
