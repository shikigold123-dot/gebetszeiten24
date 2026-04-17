import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 600,
          letterSpacing: -4,
        }}
      >
        G
      </div>
    ),
    size,
  );
}
