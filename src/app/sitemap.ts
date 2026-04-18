import type { MetadataRoute } from 'next';
import { cities } from '@/data/cities';
import { allStates } from '@/lib/states';

const BASE = 'https://gebetszeiten24.de';

export const dynamic = 'force-static';

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
  const stateRoutes: MetadataRoute.Sitemap = allStates.map((s) => ({
    url: `${BASE}/bundesland/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  return [...staticRoutes, ...stateRoutes, ...cityRoutes];
}
