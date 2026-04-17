import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f3ee',
          color: '#5c6b5a',
          fontFamily: 'serif',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: -1,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
