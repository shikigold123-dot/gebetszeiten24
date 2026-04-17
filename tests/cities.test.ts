import { describe, it, expect } from 'vitest';
import { cities } from '@/data/cities';
import { findCityBySlug, findNearbyCities, searchCities } from '@/lib/cities';

describe('cities data', () => {
  it('contains 100 entries', () => {
    expect(cities).toHaveLength(100);
  });
  it('all slugs are unique and ASCII-lowercase', () => {
    const slugs = cities.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(100);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
  it('all entries have valid German coordinates', () => {
    for (const c of cities) {
      expect(c.lat).toBeGreaterThan(47);
      expect(c.lat).toBeLessThan(56);
      expect(c.lng).toBeGreaterThan(5);
      expect(c.lng).toBeLessThan(16);
    }
  });
});

describe('findCityBySlug', () => {
  it('finds Berlin by slug', () => {
    expect(findCityBySlug('berlin')?.name).toBe('Berlin');
  });
  it('returns undefined for unknown slug', () => {
    expect(findCityBySlug('atlantis')).toBeUndefined();
  });
});

describe('findNearbyCities', () => {
  it('returns the requested count, excluding the city itself', () => {
    const berlin = findCityBySlug('berlin')!;
    const nearby = findNearbyCities(berlin, 5);
    expect(nearby).toHaveLength(5);
    expect(nearby.some((c) => c.slug === 'berlin')).toBe(false);
  });
});

describe('searchCities', () => {
  it('matches case-insensitively by name', () => {
    const results = searchCities('mün');
    expect(results.some((c) => c.slug === 'muenchen')).toBe(true);
  });
  it('returns empty array for no match', () => {
    expect(searchCities('xyznotacity')).toHaveLength(0);
  });
});
