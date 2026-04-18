import { ImageResponse } from 'next/og';
import { allStates, stateNameFromSlug, getCitiesInState } from '@/lib/states';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return allStates.map((s) => ({ state: s.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const stateName = stateNameFromSlug[slug] ?? slug;
  const cities = getCitiesInState(stateName);
  const topCities = cities
    .slice(0, 4)
    .map((c) => c.name)
    .join(' · ');

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
          <div style={{ fontSize: 28, color: '#5c6b5a', letterSpacing: 4, textTransform: 'uppercase' }}>
            Gebetszeiten24
          </div>
          <div style={{ fontSize: 80, fontWeight: 400, marginTop: 24, lineHeight: 1.1 }}>
            {`Gebetszeiten in ${stateName}`}
          </div>
          <div style={{ fontSize: 28, color: '#6b6b6b', marginTop: 24 }}>
            {`${cities.length} Städte · ${topCities}`}
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#5c6b5a' }}>
          Täglich aktuell berechnet — werbefrei
        </div>
      </div>
    ),
    size,
  );
}
