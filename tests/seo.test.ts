import { describe, it, expect } from 'vitest';
import { cityMetadata, placeJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { findCityBySlug } from '@/lib/cities';

describe('cityMetadata', () => {
  it('builds title and description with city and date', () => {
    const berlin = findCityBySlug('berlin')!;
    const date = new Date('2026-04-17T12:00:00Z');
    const meta = cityMetadata(berlin, date);
    expect(String(meta.title)).toContain('Berlin');
    expect(String(meta.description)).toContain('Berlin');
    expect(meta.alternates?.canonical).toBe('/berlin');
  });
});

describe('JSON-LD helpers', () => {
  it('placeJsonLd has @type=Place and geo coords', () => {
    const berlin = findCityBySlug('berlin')!;
    const ld = placeJsonLd(berlin);
    expect(ld['@type']).toBe('Place');
    expect(ld.geo.latitude).toBe(berlin.lat);
  });
  it('breadcrumbJsonLd returns itemListElement array', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Start', url: '/' },
      { name: 'Berlin', url: '/berlin' },
    ]);
    expect(ld.itemListElement).toHaveLength(2);
  });
  it('faqJsonLd wraps questions', () => {
    const ld = faqJsonLd([{ question: 'A?', answer: 'Yes.' }]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(1);
  });
});
