import { ImageResponse } from 'next/og';
import { cities } from '@/data/cities';
import { findCityBySlug } from '@/lib/cities';
import { computePrayerTimes } from '@/lib/adhan';
import { formatTime } from '@/lib/utils';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city)
    return new ImageResponse(<div style={{ display: 'flex' }}>Not found</div>, size);

  const now = new Date();
  const { times } = computePrayerTimes({
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    method: 'MWL',
    madhab: 'Shafi',
    date: now,
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f3ee',
          color: '#1a1a1a',
          padding: 80,
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 28,
              color: '#5c6b5a',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            Gebetszeiten24
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 400,
              marginTop: 16,
              lineHeight: 1,
            }}
          >
            {`Gebetszeiten in ${city.name}`}
          </div>
          <div style={{ fontSize: 28, color: '#6b6b6b', marginTop: 16 }}>
            {new Intl.DateTimeFormat('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(now)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 32 }}>
          <span>{`Fajr ${formatTime(times.fajr)}`}</span>
          <span>{`Dhuhr ${formatTime(times.dhuhr)}`}</span>
          <span>{`Maghrib ${formatTime(times.maghrib)}`}</span>
        </div>
      </div>
    ),
    size,
  );
}
