import { describe, it, expect } from 'vitest';
import { computePrayerTimes, computeMonth, type Prayer } from '@/lib/adhan';

const BERLIN = { lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin' };

describe('computePrayerTimes', () => {
  it('returns all 6 entries (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)', () => {
    const date = new Date('2026-06-21T12:00:00Z');
    const result = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Shafi', date });
    expect(Object.keys(result.times)).toEqual([
      'fajr',
      'sunrise',
      'dhuhr',
      'asr',
      'maghrib',
      'isha',
    ]);
  });

  it('returns Date objects in order', () => {
    const date = new Date('2026-06-21T12:00:00Z');
    const { times } = computePrayerTimes({
      ...BERLIN,
      method: 'MWL',
      madhab: 'Shafi',
      date,
    });
    expect(times.fajr.getTime()).toBeLessThan(times.sunrise.getTime());
    expect(times.sunrise.getTime()).toBeLessThan(times.dhuhr.getTime());
    expect(times.dhuhr.getTime()).toBeLessThan(times.asr.getTime());
    expect(times.asr.getTime()).toBeLessThan(times.maghrib.getTime());
    expect(times.maghrib.getTime()).toBeLessThan(times.isha.getTime());
  });

  it('produces different Fajr times for MWL vs ISNA (18 vs 15 degrees)', () => {
    const date = new Date('2026-03-21T12:00:00Z');
    const a = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Shafi', date });
    const b = computePrayerTimes({ ...BERLIN, method: 'ISNA', madhab: 'Shafi', date });
    expect(a.times.fajr.getTime()).not.toBe(b.times.fajr.getTime());
  });

  it('Hanafi Asr is later than Shafi Asr', () => {
    const date = new Date('2026-06-21T12:00:00Z');
    const shafi = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Shafi', date });
    const hanafi = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Hanafi', date });
    expect(hanafi.times.asr.getTime()).toBeGreaterThan(shafi.times.asr.getTime());
  });

  it('getNext returns fajr when called before fajr', () => {
    // Winter: in Berlin on Dec 21, fajr at 18° is around 06:00 local (05:00 UTC).
    // Reference at 03:00 UTC is safely before fajr.
    const { getNext } = computePrayerTimes({
      ...BERLIN,
      method: 'MWL',
      madhab: 'Shafi',
      date: new Date('2026-12-21T12:00:00Z'),
    });
    const next = getNext(new Date('2026-12-21T03:00:00Z'));
    expect(next?.name).toBe<Prayer>('fajr');
  });
});

describe('computeMonth', () => {
  it('returns entries for every day of the month', () => {
    const result = computeMonth({
      ...BERLIN,
      method: 'MWL',
      madhab: 'Shafi',
      year: 2026,
      month: 6,
    });
    expect(result).toHaveLength(30);
    expect(result[0].day).toBe(1);
    expect(result[29].day).toBe(30);
  });
});
