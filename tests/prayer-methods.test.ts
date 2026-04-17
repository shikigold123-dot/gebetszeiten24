import { describe, it, expect } from 'vitest';
import { prayerMethods, getMethod, DEFAULT_METHOD } from '@/lib/prayer-methods';

describe('prayer methods catalog', () => {
  it('contains 13 methods', () => {
    expect(prayerMethods).toHaveLength(13);
  });
  it('has unique keys', () => {
    const keys = prayerMethods.map((m) => m.key);
    expect(new Set(keys).size).toBe(13);
  });
  it('MWL is the default', () => {
    expect(DEFAULT_METHOD).toBe('MWL');
  });
  it('getMethod returns MWL info', () => {
    const m = getMethod('MWL');
    expect(m.label).toBe('Muslim World League (MWL)');
    expect(m.fajrAngle).toBe(18);
    expect(m.ishaAngle).toBe(17);
  });
  it('getMethod falls back to default for unknown keys', () => {
    const m = getMethod('UNKNOWN' as never);
    expect(m.key).toBe('MWL');
  });
});
