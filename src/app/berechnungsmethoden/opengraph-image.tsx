import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
            Berechnungsmethoden für Gebetszeiten
          </div>
          <div style={{ fontSize: 28, color: '#6b6b6b', marginTop: 24 }}>
            MWL · ISNA · Diyanet · Umm al-Qura · Ägyptisch und 8 weitere
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#5c6b5a' }}>
          13 Methoden — weltweit anerkannt
        </div>
      </div>
    ),
    size,
  );
}
