import { describe, it, expect } from 'vitest';
import { formatHijri, formatHijriShort } from '@/lib/hijri';

describe('formatHijri', () => {
  it('returns German long format for a known date', () => {
    const s = formatHijri(new Date('2026-04-17T12:00:00Z'));
    expect(s).toMatch(/\d{1,2}\.\s.+\s14\d{2}/);
  });
  it('is a non-empty string', () => {
    expect(formatHijri(new Date())).not.toBe('');
  });
});

describe('formatHijriShort', () => {
  it('returns a compact form', () => {
    const s = formatHijriShort(new Date('2026-04-17T12:00:00Z'));
    expect(s.length).toBeLessThan(20);
  });
});
