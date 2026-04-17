import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://gebetszeiten24.de/sitemap.xml',
    host: 'https://gebetszeiten24.de',
  };
}
