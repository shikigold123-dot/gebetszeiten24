'use client';
import { useEffect, useState } from 'react';
import type { City } from '@/data/cities';
import { computePrayerTimes, type Prayer } from '@/lib/adhan';
import { readPrefs } from '@/lib/user-prefs';
import { Card } from './ui/card';

const LABEL: Record<Prayer, string> = {
  fajr: 'Fajr',
  sunrise: 'Sonnenaufgang',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function NextPrayerCard({ city }: { city: City }) {
  const [info, setInfo] = useState<{ label: string; remaining: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const prefs = readPrefs();
      const now = new Date();
      const { getNext } = computePrayerTimes({
        lat: city.lat,
        lng: city.lng,
        timezone: city.timezone,
        method: prefs.method,
        madhab: prefs.madhab,
        date: now,
      });
      let next = getNext(now);
      if (!next) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        next = computePrayerTimes({
          lat: city.lat,
          lng: city.lng,
          timezone: city.timezone,
          method: prefs.method,
          madhab: prefs.madhab,
          date: tomorrow,
        }).getNext(tomorrow);
      }
      if (!next) return;
      const diffMs = next.time.getTime() - now.getTime();
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      setInfo({
        label: LABEL[next.name],
        remaining: `${h}h ${m.toString().padStart(2, '0')}m`,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    const onPrefs = () => tick();
    window.addEventListener('gz24:prefs', onPrefs);
    return () => {
      clearInterval(id);
      window.removeEventListener('gz24:prefs', onPrefs);
    };
  }, [city]);

  if (!info) return null;
  return (
    <Card className="border-sage/40 bg-sage/5">
      <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
        Nächstes Gebet
      </p>
      <p className="mt-2 font-serif text-3xl">{info.label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">in {info.remaining}</p>
    </Card>
  );
}
