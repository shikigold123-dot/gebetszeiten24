'use client';
import { useEffect, useMemo, useState } from 'react';
import type { City } from '@/data/cities';
import { computePrayerTimes, type Prayer } from '@/lib/adhan';
import { readPrefs } from '@/lib/user-prefs';
import { formatTime, cn } from '@/lib/utils';

const PRAYER_LABELS: Record<Prayer, string> = {
  fajr: 'Fajr',
  sunrise: 'Sonnenaufgang',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

type Props = {
  city: City;
  initialTimes: Record<Prayer, string>;
  initialDate: string;
};

export function PrayerTimesTable({ city, initialTimes, initialDate }: Props) {
  const [times, setTimes] = useState(initialTimes);
  const [currentPrayer, setCurrentPrayer] = useState<Prayer | null>(null);

  useEffect(() => {
    const prefs = readPrefs();
    const today = new Date();
    const sameDay = today.toDateString() === new Date(initialDate).toDateString();

    if (!sameDay || prefs.method !== 'MWL' || prefs.madhab !== 'Shafi') {
      const { times: t } = computePrayerTimes({
        lat: city.lat,
        lng: city.lng,
        timezone: city.timezone,
        method: prefs.method,
        madhab: prefs.madhab,
        date: today,
      });
      setTimes({
        fajr: formatTime(t.fajr),
        sunrise: formatTime(t.sunrise),
        dhuhr: formatTime(t.dhuhr),
        asr: formatTime(t.asr),
        maghrib: formatTime(t.maghrib),
        isha: formatTime(t.isha),
      });
    }

    const update = () => {
      const prefsNow = readPrefs();
      const now = new Date();
      const { times: t, getNext } = computePrayerTimes({
        lat: city.lat,
        lng: city.lng,
        timezone: city.timezone,
        method: prefsNow.method,
        madhab: prefsNow.madhab,
        date: now,
      });
      setTimes({
        fajr: formatTime(t.fajr),
        sunrise: formatTime(t.sunrise),
        dhuhr: formatTime(t.dhuhr),
        asr: formatTime(t.asr),
        maghrib: formatTime(t.maghrib),
        isha: formatTime(t.isha),
      });
      const next = getNext(now);
      if (!next) {
        setCurrentPrayer('isha');
        return;
      }
      const order: Prayer[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const idx = order.indexOf(next.name);
      setCurrentPrayer(idx > 0 ? order[idx - 1] : 'isha');
    };
    update();
    const interval = setInterval(update, 60_000);
    const handler = () => update();
    window.addEventListener('gz24:prefs', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gz24:prefs', handler);
    };
  }, [city, initialDate]);

  const rows = useMemo(() => Object.entries(times) as [Prayer, string][], [times]);

  return (
    <ul
      className="grid gap-2 rounded-3xl border border-[var(--color-border)] p-4 sm:p-6"
      role="list"
    >
      {rows.map(([prayer, time]) => (
        <li
          key={prayer}
          className={cn(
            'flex items-baseline justify-between rounded-2xl px-4 py-3 transition-colors',
            currentPrayer === prayer && 'bg-sage/10 ring-1 ring-sage',
          )}
        >
          <span className="font-serif text-lg">{PRAYER_LABELS[prayer]}</span>
          <span className="font-mono text-2xl tabular-nums sm:text-3xl">{time}</span>
        </li>
      ))}
    </ul>
  );
}
