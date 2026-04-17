import { cities, type City } from '@/data/cities';

export function findCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return cities.slice(0, 20);
  return cities.filter(
    (c) => c.name.toLowerCase().includes(q) || c.slug.includes(q),
  );
}

export function findNearbyCities(origin: City, count: number): City[] {
  return cities
    .filter((c) => c.slug !== origin.slug)
    .map((c) => ({ city: c, dist: haversine(origin, c) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.city);
}

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
