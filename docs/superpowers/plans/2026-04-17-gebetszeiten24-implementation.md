# Gebetszeiten24.de Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully static, SEO-optimized prayer times website for the top 100 German cities at gebetszeiten24.de, deployable to Cloudflare Pages / Vercel / any static host.

**Architecture:** Next.js 15 App Router with `output: 'export'` for pure static HTML generation. Prayer times computed locally with `adhan-js` (no external APIs). 100 cities × 2 routes (day + month) + home + legal pages = ~305 static files. Daily freshness via GitHub Actions cron-triggered rebuilds. Client-side JS re-computes times when user changes method/madhab and as a fallback past midnight before the next rebuild. Hijri dates rendered via native `Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura')` — no dependency.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS v4, shadcn/ui primitives, `adhan`, Vitest, Plausible Analytics, GitHub Actions.

---

## Security Note: JSON-LD Injection

All structured-data (`<script type="application/ld+json">`) blocks in this plan use a dedicated helper that safely escapes any `<` characters before injecting into HTML. The helper lives in `src/lib/seo.ts` (see Task 9) and is the ONLY sanctioned way to render JSON-LD in this codebase. Never pass user input into it — all inputs come from our typed data files (`cities.ts`, static FAQ templates).

---

## File Structure

**Source files to create:**
```
.github/workflows/ci.yml                   CI: lint + typecheck + test + build
.github/workflows/daily-rebuild.yml        Cron rebuild trigger
public/pattern.svg                         Islamic geometric pattern (subtle bg)
public/favicon.ico
public/apple-touch-icon.png

src/app/layout.tsx                         Root layout, fonts, theme
src/app/page.tsx                           Homepage
src/app/[city]/page.tsx                    City prayer times page
src/app/[city]/monat/page.tsx              Month view per city
src/app/[city]/opengraph-image.tsx         Per-city OG image generator
src/app/berechnungsmethoden/page.tsx       Calculation methods explainer
src/app/impressum/page.tsx                 Impressum (legal)
src/app/datenschutz/page.tsx               Datenschutz (legal)
src/app/not-found.tsx                      404 page
src/app/sitemap.ts                         sitemap.xml generator
src/app/robots.ts                          robots.txt

src/components/header.tsx                  Top navigation
src/components/footer.tsx                  Footer with all 100 cities
src/components/prayer-times-table.tsx      Client component: renders + re-computes times
src/components/next-prayer-card.tsx        Client: countdown
src/components/method-selector.tsx         Client: method + madhab dropdowns with localStorage
src/components/city-search.tsx             Client: combobox over all cities
src/components/city-card.tsx               Small city preview card (used on homepage)
src/components/faq-accordion.tsx           FAQ with safe structured data
src/components/theme-toggle.tsx            Light/dark toggle
src/components/breadcrumbs.tsx             Breadcrumb nav
src/components/json-ld.tsx                 Single sanctioned JSON-LD renderer
src/components/ui/button.tsx               Primitive
src/components/ui/card.tsx                 Primitive
src/components/ui/accordion.tsx            Primitive
src/components/ui/select.tsx               Primitive

src/lib/adhan.ts                           Wrapper around adhan-js
src/lib/prayer-methods.ts                  13-method catalog + German labels
src/lib/hijri.ts                           Intl-based Hijri date formatting
src/lib/cities.ts                          City lookup helpers (findBySlug, nearby)
src/lib/seo.ts                             Metadata + JSON-LD builders + escape helper
src/lib/utils.ts                           cn() utility + misc
src/lib/user-prefs.ts                      localStorage read/write for user prefs

src/data/cities.ts                         Top 100 German cities (static array)
src/styles/globals.css                     Tailwind + CSS variables

tests/adhan.test.ts
tests/prayer-methods.test.ts
tests/hijri.test.ts
tests/cities.test.ts
tests/seo.test.ts

next.config.ts
tailwind.config.ts
tsconfig.json
vitest.config.ts
package.json
.eslintrc.json
.prettierrc
.gitignore
README.md
```

**Files with clear single responsibilities:**
- `adhan.ts` — only wraps `adhan-js` into typed helpers
- `prayer-methods.ts` — only the catalog + lookups
- `hijri.ts` — only Hijri date formatting
- `cities.ts` (data) — only data, no logic
- `cities.ts` (lib) — only lookup/search logic over the data
- `seo.ts` — only metadata + JSON-LD construction
- `json-ld.tsx` — only the single sanctioned JSON-LD renderer (escapes `<`)
- `user-prefs.ts` — only localStorage I/O

---

## Task 1: Initialize Next.js project & tooling

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `vitest.config.ts`, `README.md`
- Create: `src/app/layout.tsx`, `src/app/page.tsx` (placeholders), `src/styles/globals.css`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/matin/Desktop/gebetszeiten_24
git init
git branch -M main
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "gebetszeiten24",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "adhan": "4.4.3",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.4"
  },
  "devDependencies": {
    "@types/node": "22.10.0",
    "@types/react": "19.0.0",
    "@types/react-dom": "19.0.0",
    "@vitejs/plugin-react": "4.3.4",
    "eslint": "9.16.0",
    "eslint-config-next": "15.1.0",
    "prettier": "3.4.1",
    "prettier-plugin-tailwindcss": "0.6.9",
    "tailwindcss": "4.0.0",
    "@tailwindcss/postcss": "4.0.0",
    "postcss": "8.4.49",
    "typescript": "5.7.2",
    "vitest": "2.1.8",
    "@testing-library/react": "16.1.0",
    "jsdom": "25.0.1"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts (static export)**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 5: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#f5f3ee',
        sage: { DEFAULT: '#5c6b5a', light: '#8fa08c', dark: '#3d4a3c' },
        gold: '#c9a961',
        'sage-ink': '#1a2420',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Create src/styles/globals.css**

```css
@import 'tailwindcss';

@theme {
  --color-background: #f5f3ee;
  --color-foreground: #1a1a1a;
  --color-sage: #5c6b5a;
  --color-gold: #c9a961;
  --color-border: #e5e2dd;
  --color-muted: #6b6b6b;
}

.dark {
  --color-background: #1a2420;
  --color-foreground: #f5f3ee;
  --color-sage: #8fa08c;
  --color-gold: #d4b876;
  --color-border: #2a3530;
  --color-muted: #9a9a9a;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-feature-settings: 'cv11', 'ss01';
}
```

- [ ] **Step 7: Create .gitignore, .eslintrc.json, .prettierrc**

`.gitignore`:
```
node_modules/
.next/
out/
.DS_Store
.env*.local
*.tsbuildinfo
coverage/
```

`.eslintrc.json`:
```json
{ "extends": "next/core-web-vitals" }
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 8: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 9: Create placeholder src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import '@/styles/globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://gebetszeiten24.de'),
  title: { default: 'Gebetszeiten24', template: '%s | Gebetszeiten24' },
  description: 'Genaue Gebetszeiten für alle großen Städte in Deutschland.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create placeholder src/app/page.tsx**

```tsx
export default function HomePage() {
  return <main className="p-8"><h1 className="font-serif text-4xl">Gebetszeiten24</h1></main>;
}
```

- [ ] **Step 11: Install dependencies and verify build**

Run: `npm install`
Then: `npm run build`
Expected: Build succeeds, `out/` directory created, placeholder homepage visible.

- [ ] **Step 12: Initial commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 + Tailwind v4 + Vitest + static export"
```

---

## Task 2: Prayer methods catalog

**Files:**
- Create: `src/lib/prayer-methods.ts`
- Create: `tests/prayer-methods.test.ts`

- [ ] **Step 1: Write failing test**

`tests/prayer-methods.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- prayer-methods`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement src/lib/prayer-methods.ts**

```ts
export type MethodKey =
  | 'MWL' | 'ISNA' | 'Egyptian' | 'Karachi' | 'UmmAlQura'
  | 'Dubai' | 'Qatar' | 'Kuwait' | 'MoonsightingCommittee'
  | 'Singapore' | 'Turkey' | 'Tehran' | 'NorthAmerica';

export type MethodInfo = {
  key: MethodKey;
  label: string;
  description: string;
  fajrAngle: number;
  ishaAngle: number;
};

export const prayerMethods: MethodInfo[] = [
  { key: 'MWL', label: 'Muslim World League (MWL)', description: 'In Deutschland und Europa am weitesten verbreitet.', fajrAngle: 18, ishaAngle: 17 },
  { key: 'ISNA', label: 'Islamic Society of North America (ISNA)', description: 'Verbreitet in Nordamerika.', fajrAngle: 15, ishaAngle: 15 },
  { key: 'Egyptian', label: 'Ägyptische Behörde (Egyptian General Authority)', description: 'Verwendet in Ägypten, Syrien, Libanon, Malaysia.', fajrAngle: 19.5, ishaAngle: 17.5 },
  { key: 'Karachi', label: 'University of Islamic Sciences, Karachi', description: 'Verbreitet in Pakistan, Bangladesch, Indien, Afghanistan.', fajrAngle: 18, ishaAngle: 18 },
  { key: 'UmmAlQura', label: 'Umm al-Qura Universität, Mekka', description: 'Offizielle Methode in Saudi-Arabien. Isha 90 Min nach Maghrib.', fajrAngle: 18.5, ishaAngle: 0 },
  { key: 'Dubai', label: 'Dubai (VAE)', description: 'Offiziell in den Vereinigten Arabischen Emiraten.', fajrAngle: 18.2, ishaAngle: 18.2 },
  { key: 'Qatar', label: 'Katar', description: 'Wie UmmAlQura, aber Isha 90 Min nach Maghrib.', fajrAngle: 18, ishaAngle: 0 },
  { key: 'Kuwait', label: 'Kuwait', description: 'Offiziell in Kuwait.', fajrAngle: 18, ishaAngle: 17.5 },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee Worldwide', description: 'Saisonal angepasste Methode.', fajrAngle: 18, ishaAngle: 18 },
  { key: 'Singapore', label: 'Singapur (MUIS)', description: 'Offiziell in Singapur.', fajrAngle: 20, ishaAngle: 18 },
  { key: 'Turkey', label: 'Diyanet İşleri Başkanlığı (Türkei)', description: 'Offizielle türkische Methode.', fajrAngle: 18, ishaAngle: 17 },
  { key: 'Tehran', label: 'Institute of Geophysics, Tehran', description: 'Verbreitet in Iran — schiitische Methode.', fajrAngle: 17.7, ishaAngle: 14 },
  { key: 'NorthAmerica', label: 'Nordamerika (ISNA Alternative)', description: 'Alternative ISNA-Parameter.', fajrAngle: 15, ishaAngle: 15 },
];

export const DEFAULT_METHOD: MethodKey = 'MWL';
export const DEFAULT_MADHAB: 'Shafi' | 'Hanafi' = 'Shafi';

export function getMethod(key: MethodKey): MethodInfo {
  return prayerMethods.find((m) => m.key === key) ?? prayerMethods[0];
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- prayer-methods`
Expected: PASS (5 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/prayer-methods.ts tests/prayer-methods.test.ts
git commit -m "feat: add prayer methods catalog with 13 methods and tests"
```

---

## Task 3: `adhan-js` wrapper with tests

**Files:**
- Create: `src/lib/adhan.ts`
- Create: `tests/adhan.test.ts`

- [ ] **Step 1: Write failing test**

`tests/adhan.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computePrayerTimes, computeMonth, type Prayer } from '@/lib/adhan';

const BERLIN = { lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin' };

describe('computePrayerTimes', () => {
  it('returns all 6 entries (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)', () => {
    const date = new Date('2026-06-21T12:00:00Z');
    const result = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Shafi', date });
    expect(Object.keys(result.times)).toEqual(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);
  });

  it('returns Date objects in order', () => {
    const date = new Date('2026-06-21T12:00:00Z');
    const { times } = computePrayerTimes({ ...BERLIN, method: 'MWL', madhab: 'Shafi', date });
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
    const { getNext } = computePrayerTimes({
      ...BERLIN, method: 'MWL', madhab: 'Shafi', date: new Date('2026-06-21T00:00:00Z'),
    });
    const next = getNext(new Date('2026-06-21T01:00:00Z'));
    expect(next?.name).toBe<Prayer>('fajr');
  });
});

describe('computeMonth', () => {
  it('returns entries for every day of the month', () => {
    const result = computeMonth({ ...BERLIN, method: 'MWL', madhab: 'Shafi', year: 2026, month: 6 });
    expect(result).toHaveLength(30);
    expect(result[0].day).toBe(1);
    expect(result[29].day).toBe(30);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- adhan`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement src/lib/adhan.ts**

```ts
import {
  Coordinates,
  CalculationMethod,
  type CalculationParameters,
  Madhab,
  PrayerTimes,
} from 'adhan';
import { type MethodKey } from './prayer-methods';

export type Prayer = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type ComputeInput = {
  lat: number;
  lng: number;
  timezone: string;
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
  date: Date;
};

export type PrayerTimeMap = {
  fajr: Date; sunrise: Date; dhuhr: Date; asr: Date; maghrib: Date; isha: Date;
};

export type ComputeResult = {
  times: PrayerTimeMap;
  getNext: (ref: Date) => { name: Prayer; time: Date } | null;
};

function methodParams(key: MethodKey): CalculationParameters {
  switch (key) {
    case 'MWL': return CalculationMethod.MuslimWorldLeague();
    case 'ISNA': return CalculationMethod.NorthAmerica();
    case 'Egyptian': return CalculationMethod.Egyptian();
    case 'Karachi': return CalculationMethod.Karachi();
    case 'UmmAlQura': return CalculationMethod.UmmAlQura();
    case 'Dubai': return CalculationMethod.Dubai();
    case 'Qatar': return CalculationMethod.Qatar();
    case 'Kuwait': return CalculationMethod.Kuwait();
    case 'MoonsightingCommittee': return CalculationMethod.MoonsightingCommittee();
    case 'Singapore': return CalculationMethod.Singapore();
    case 'Turkey': return CalculationMethod.Turkey();
    case 'Tehran': return CalculationMethod.Tehran();
    case 'NorthAmerica': return CalculationMethod.NorthAmerica();
    default: return CalculationMethod.MuslimWorldLeague();
  }
}

function paramsFor(method: MethodKey, madhab: 'Shafi' | 'Hanafi'): CalculationParameters {
  const p = methodParams(method);
  p.madhab = madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}

export function computePrayerTimes(input: ComputeInput): ComputeResult {
  const coords = new Coordinates(input.lat, input.lng);
  const params = paramsFor(input.method, input.madhab);
  const pt = new PrayerTimes(coords, input.date, params);

  const times: PrayerTimeMap = {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
  };

  const getNext = (ref: Date) => {
    const order: Prayer[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const name of order) {
      if (times[name].getTime() > ref.getTime()) {
        return { name, time: times[name] };
      }
    }
    return null;
  };

  return { times, getNext };
}

export type MonthDay = { day: number; date: Date; times: PrayerTimeMap };

export type ComputeMonthInput = Omit<ComputeInput, 'date'> & { year: number; month: number };

export function computeMonth(input: ComputeMonthInput): MonthDay[] {
  const daysInMonth = new Date(input.year, input.month, 0).getDate();
  const entries: MonthDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(input.year, input.month - 1, d, 12, 0, 0);
    const { times } = computePrayerTimes({ ...input, date });
    entries.push({ day: d, date, times });
  }
  return entries;
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- adhan`
Expected: PASS (6 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/adhan.ts tests/adhan.test.ts
git commit -m "feat: add adhan-js wrapper with method/madhab support and month computation"
```

---

## Task 4: Hijri date formatting via Intl

**Files:**
- Create: `src/lib/hijri.ts`
- Create: `tests/hijri.test.ts`

- [ ] **Step 1: Write failing test**

`tests/hijri.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- hijri`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement src/lib/hijri.ts**

```ts
const longFormatter = new Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

export function formatHijri(date: Date): string {
  return longFormatter.format(date);
}

export function formatHijriShort(date: Date): string {
  return shortFormatter.format(date);
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- hijri`
Expected: PASS (3 tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/hijri.ts tests/hijri.test.ts
git commit -m "feat: add Hijri date formatter using Intl Umm al-Qura calendar"
```

---

## Task 5: Cities data (top 100) + lookup lib

**Files:**
- Create: `src/data/cities.ts`
- Create: `src/lib/cities.ts`
- Create: `tests/cities.test.ts`

- [ ] **Step 1: Write failing test for lookup lib**

`tests/cities.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { cities } from '@/data/cities';
import { findCityBySlug, findNearbyCities, searchCities } from '@/lib/cities';

describe('cities data', () => {
  it('contains 100 entries', () => {
    expect(cities).toHaveLength(100);
  });
  it('all slugs are unique and ASCII-lowercase', () => {
    const slugs = cities.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(100);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
  it('all entries have valid German coordinates', () => {
    for (const c of cities) {
      expect(c.lat).toBeGreaterThan(47);
      expect(c.lat).toBeLessThan(56);
      expect(c.lng).toBeGreaterThan(5);
      expect(c.lng).toBeLessThan(16);
    }
  });
});

describe('findCityBySlug', () => {
  it('finds Berlin by slug', () => {
    expect(findCityBySlug('berlin')?.name).toBe('Berlin');
  });
  it('returns undefined for unknown slug', () => {
    expect(findCityBySlug('atlantis')).toBeUndefined();
  });
});

describe('findNearbyCities', () => {
  it('returns the requested count, excluding the city itself', () => {
    const berlin = findCityBySlug('berlin')!;
    const nearby = findNearbyCities(berlin, 5);
    expect(nearby).toHaveLength(5);
    expect(nearby.some((c) => c.slug === 'berlin')).toBe(false);
  });
});

describe('searchCities', () => {
  it('matches case-insensitively by name', () => {
    const results = searchCities('mün');
    expect(results.some((c) => c.slug === 'muenchen')).toBe(true);
  });
  it('returns empty array for no match', () => {
    expect(searchCities('xyznotacity')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- cities`
Expected: FAIL, modules missing.

- [ ] **Step 3: Create src/data/cities.ts with top 100 cities**

Use the following structure. **Populate all 100 entries** ordered by population (2024 Destatis figures) with coordinates from OpenStreetMap Nominatim. The first 10 are shown below; append the remaining 90 following the same pattern.

```ts
export type City = {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  timezone: 'Europe/Berlin';
};

export const cities: City[] = [
  { slug: 'berlin', name: 'Berlin', state: 'Berlin', lat: 52.5200, lng: 13.4050, population: 3769495, timezone: 'Europe/Berlin' },
  { slug: 'hamburg', name: 'Hamburg', state: 'Hamburg', lat: 53.5511, lng: 9.9937, population: 1906411, timezone: 'Europe/Berlin' },
  { slug: 'muenchen', name: 'München', state: 'Bayern', lat: 48.1351, lng: 11.5820, population: 1488202, timezone: 'Europe/Berlin' },
  { slug: 'koeln', name: 'Köln', state: 'Nordrhein-Westfalen', lat: 50.9375, lng: 6.9603, population: 1083498, timezone: 'Europe/Berlin' },
  { slug: 'frankfurt-am-main', name: 'Frankfurt am Main', state: 'Hessen', lat: 50.1109, lng: 8.6821, population: 773068, timezone: 'Europe/Berlin' },
  { slug: 'stuttgart', name: 'Stuttgart', state: 'Baden-Württemberg', lat: 48.7758, lng: 9.1829, population: 626275, timezone: 'Europe/Berlin' },
  { slug: 'duesseldorf', name: 'Düsseldorf', state: 'Nordrhein-Westfalen', lat: 51.2277, lng: 6.7735, population: 629047, timezone: 'Europe/Berlin' },
  { slug: 'leipzig', name: 'Leipzig', state: 'Sachsen', lat: 51.3397, lng: 12.3731, population: 624689, timezone: 'Europe/Berlin' },
  { slug: 'dortmund', name: 'Dortmund', state: 'Nordrhein-Westfalen', lat: 51.5136, lng: 7.4653, population: 593317, timezone: 'Europe/Berlin' },
  { slug: 'essen', name: 'Essen', state: 'Nordrhein-Westfalen', lat: 51.4556, lng: 7.0116, population: 584580, timezone: 'Europe/Berlin' },
  // Continue with the remaining 90 cities from Appendix A below.
];
```

**Appendix A — remaining 90 cities** (populate with coordinates + population + state): Bremen, Dresden, Hannover, Nürnberg, Duisburg, Bochum, Wuppertal, Bielefeld, Bonn, Münster, Mannheim, Karlsruhe, Augsburg, Wiesbaden, Mönchengladbach, Gelsenkirchen, Braunschweig, Kiel, Chemnitz, Aachen, Halle (Saale), Magdeburg, Freiburg im Breisgau, Krefeld, Lübeck, Oberhausen, Erfurt, Mainz, Rostock, Kassel, Hagen, Hamm, Saarbrücken, Mülheim an der Ruhr, Potsdam, Ludwigshafen am Rhein, Oldenburg, Leverkusen, Osnabrück, Solingen, Heidelberg, Herne, Neuss, Darmstadt, Paderborn, Regensburg, Ingolstadt, Würzburg, Fürth, Wolfsburg, Offenbach am Main, Ulm, Heilbronn, Pforzheim, Göttingen, Bottrop, Trier, Recklinghausen, Reutlingen, Bremerhaven, Koblenz, Bergisch Gladbach, Jena, Remscheid, Erlangen, Moers, Siegen, Hildesheim, Salzgitter, Cottbus, Kaiserslautern, Gütersloh, Schwerin, Witten, Gera, Iserlohn, Ludwigsburg, Esslingen am Neckar, Zwickau, Düren, Ratingen, Flensburg, Lünen, Villingen-Schwenningen, Konstanz, Marl, Worms, Velbert, Dessau-Roßlau, Minden, Neumünster, Norderstedt, Delmenhorst, Wilhelmshaven, Viersen, Gladbeck, Dorsten, Rheine, Detmold, Troisdorf.

**Slug rules:** `ü→ue`, `ö→oe`, `ä→ae`, `ß→ss`, spaces→`-`, lowercase, strip parentheses. Examples:
- `frankfurt-am-main`, `villingen-schwenningen`, `halle-saale`, `ludwigshafen-am-rhein`, `bergisch-gladbach`, `dessau-rosslau`, `esslingen-am-neckar`.

Coordinates & population should be fetched once (e.g. Wikipedia infobox + OSM Nominatim) and stored inline — no runtime lookups.

- [ ] **Step 4: Implement src/lib/cities.ts**

```ts
import { cities, type City } from '@/data/cities';

export function findCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function searchCities(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return cities.slice(0, 20);
  return cities.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
}

export function findNearbyCities(origin: City, count: number): City[] {
  return cities
    .filter((c) => c.slug !== origin.slug)
    .map((c) => ({ city: c, dist: haversine(origin, c) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.city);
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
```

- [ ] **Step 5: Run test — expect PASS**

Run: `npm test -- cities`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/cities.ts src/lib/cities.ts tests/cities.test.ts
git commit -m "feat: add top 100 German cities data and lookup helpers"
```

---

## Task 6: User preferences (localStorage)

**Files:**
- Create: `src/lib/user-prefs.ts`

- [ ] **Step 1: Implement user-prefs.ts**

```ts
'use client';
import type { MethodKey } from './prayer-methods';

export type UserPrefs = {
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
  theme: 'light' | 'dark' | 'system';
  lastCity?: string;
};

const KEY = 'gz24:prefs';
const DEFAULTS: UserPrefs = { method: 'MWL', madhab: 'Shafi', theme: 'system' };

export function readPrefs(): UserPrefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function writePrefs(patch: Partial<UserPrefs>): UserPrefs {
  const next = { ...readPrefs(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/user-prefs.ts
git commit -m "feat: add user preferences (localStorage, no account)"
```

---

## Task 7: Utilities + basic UI primitives

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`, `card.tsx`, `accordion.tsx`, `select.tsx`

- [ ] **Step 1: Create utils.ts**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  }).format(date);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  }).format(date);
}
```

- [ ] **Step 2: Create UI primitives**

`src/components/ui/button.tsx`:
```tsx
import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-50',
        variant === 'default' && 'bg-sage text-cream hover:bg-sage-dark',
        variant === 'ghost' && 'hover:bg-sage/10',
        variant === 'outline' && 'border border-sage text-sage hover:bg-sage/10',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-5 text-sm',
        size === 'lg' && 'h-12 px-7 text-base',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
```

`src/components/ui/card.tsx`:
```tsx
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm', className)} {...props} />;
}
```

`src/components/ui/accordion.tsx`:
```tsx
'use client';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AccordionItem = { question: string; answer: ReactNode };

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={cn('divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]', className)}>
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left font-medium hover:bg-sage/5"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.question}</span>
            <span aria-hidden className={cn('transition-transform', open === i && 'rotate-45')}>+</span>
          </button>
          {open === i && <div className="px-5 pb-5 text-[var(--color-muted)]">{item.answer}</div>}
        </div>
      ))}
    </div>
  );
}
```

`src/components/ui/select.tsx`:
```tsx
'use client';
import { cn } from '@/lib/utils';
import type { SelectHTMLAttributes } from 'react';

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils.ts src/components/ui
git commit -m "feat: add utility helpers and minimal UI primitives"
```

---

## Task 8: Header, Footer, Layout, JsonLd helper

**Files:**
- Create: `src/components/header.tsx`, `footer.tsx`, `breadcrumbs.tsx`, `theme-toggle.tsx`, `json-ld.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create json-ld.tsx (the ONLY place that renders JSON-LD)**

This component is the single sanctioned JSON-LD renderer. It escapes `<` so script tags cannot break out. All structured-data rendering across the codebase MUST use this component — do not inline `dangerouslySetInnerHTML` for JSON-LD anywhere else.

```tsx
export function JsonLd({ data }: { data: unknown }) {
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
```

- [ ] **Step 2: Create theme-toggle.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { readPrefs, writePrefs } from '@/lib/user-prefs';
import { Button } from './ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    setTheme(readPrefs().theme);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && sysDark);
    html.classList.toggle('dark', isDark);
  }, [theme]);

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    writePrefs({ theme: next });
  };

  return (
    <Button variant="ghost" size="sm" onClick={cycle} aria-label="Farbschema umschalten">
      {theme === 'light' ? 'Hell' : theme === 'dark' ? 'Dunkel' : 'Auto'}
    </Button>
  );
}
```

- [ ] **Step 3: Create header.tsx**

```tsx
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Gebetszeiten<span className="text-gold">24</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/berechnungsmethoden" className="hover:text-sage">Methoden</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create footer.tsx**

```tsx
import Link from 'next/link';
import { cities } from '@/data/cities';

export function Footer() {
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-2xl">Alle Städte</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Gebetszeiten für die 100 größten Städte Deutschlands.</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="hover:text-sage">{c.name}</Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-6 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
          <Link href="/impressum" className="hover:text-sage">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-sage">Datenschutz</Link>
          <Link href="/berechnungsmethoden" className="hover:text-sage">Berechnungsmethoden</Link>
          <span className="ml-auto">(c) {new Date().getFullYear()} Gebetszeiten24</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Create breadcrumbs.tsx**

```tsx
import Link from 'next/link';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href ? <Link href={c.href} className="hover:text-sage">{c.label}</Link> : <span>{c.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 6: Update src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import '@/styles/globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://gebetszeiten24.de'),
  title: { default: 'Gebetszeiten24 — Gebetszeiten für Deutschland', template: '%s | Gebetszeiten24' },
  description: 'Genaue Gebetszeiten für alle großen Städte in Deutschland. Alle Berechnungsmethoden, Monatsansicht, werbefrei.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'de_DE', siteName: 'Gebetszeiten24' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds, `out/index.html` contains header + footer + city list.

- [ ] **Step 8: Commit**

```bash
git add src/app/layout.tsx src/components/header.tsx src/components/footer.tsx src/components/breadcrumbs.tsx src/components/theme-toggle.tsx src/components/json-ld.tsx
git commit -m "feat: add layout, header, footer, theme toggle and safe JSON-LD renderer"
```

---

## Task 9: SEO metadata builders

**Files:**
- Create: `src/lib/seo.ts`
- Create: `tests/seo.test.ts`

- [ ] **Step 1: Write failing test**

`tests/seo.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { cityMetadata, placeJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { findCityBySlug } from '@/lib/cities';

describe('cityMetadata', () => {
  it('builds title and description with city and date', () => {
    const berlin = findCityBySlug('berlin')!;
    const date = new Date('2026-04-17T12:00:00Z');
    const meta = cityMetadata(berlin, date);
    expect(String(meta.title)).toContain('Berlin');
    expect(String(meta.description)).toContain('Berlin');
    expect(meta.alternates?.canonical).toBe('/berlin');
  });
});

describe('JSON-LD helpers', () => {
  it('placeJsonLd has @type=Place and geo coords', () => {
    const berlin = findCityBySlug('berlin')!;
    const ld = placeJsonLd(berlin);
    expect(ld['@type']).toBe('Place');
    expect(ld.geo.latitude).toBe(berlin.lat);
  });
  it('breadcrumbJsonLd returns itemListElement array', () => {
    const ld = breadcrumbJsonLd([{ name: 'Start', url: '/' }, { name: 'Berlin', url: '/berlin' }]);
    expect(ld.itemListElement).toHaveLength(2);
  });
  it('faqJsonLd wraps questions', () => {
    const ld = faqJsonLd([{ question: 'A?', answer: 'Yes.' }]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- seo`
Expected: FAIL.

- [ ] **Step 3: Implement src/lib/seo.ts**

```ts
import type { Metadata } from 'next';
import type { City } from '@/data/cities';
import { formatDateLong } from './utils';

export function cityMetadata(city: City, date: Date): Metadata {
  const dateStr = formatDateLong(date);
  const title = `Gebetszeiten ${city.name} — ${dateStr}`;
  const description = `Gebetszeiten für ${city.name} am ${dateStr}. Alle Berechnungsmethoden, Monatsansicht, werbefrei. Jetzt aktuelle Zeiten abrufen.`;
  return {
    title,
    description,
    alternates: { canonical: `/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `/${city.slug}`,
      type: 'website',
      locale: 'de_DE',
      siteName: 'Gebetszeiten24',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function placeJsonLd(city: City) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place' as const,
    name: city.name,
    address: { '@type': 'PostalAddress', addressRegion: city.state, addressCountry: 'DE' },
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `https://gebetszeiten24.de${it.url}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage' as const,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `npm test -- seo`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts tests/seo.test.ts
git commit -m "feat: add SEO metadata and JSON-LD data builders"
```

---

## Task 10: Prayer times table (client component)

**Files:**
- Create: `src/components/prayer-times-table.tsx`

- [ ] **Step 1: Implement the component**

```tsx
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
        lat: city.lat, lng: city.lng, timezone: city.timezone,
        method: prefs.method, madhab: prefs.madhab, date: today,
      });
      setTimes({
        fajr: formatTime(t.fajr), sunrise: formatTime(t.sunrise),
        dhuhr: formatTime(t.dhuhr), asr: formatTime(t.asr),
        maghrib: formatTime(t.maghrib), isha: formatTime(t.isha),
      });
    }

    const update = () => {
      const prefsNow = readPrefs();
      const now = new Date();
      const { getNext } = computePrayerTimes({
        lat: city.lat, lng: city.lng, timezone: city.timezone,
        method: prefsNow.method, madhab: prefsNow.madhab, date: now,
      });
      const next = getNext(now);
      if (!next) { setCurrentPrayer('isha'); return; }
      const order: Prayer[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const idx = order.indexOf(next.name);
      setCurrentPrayer(idx > 0 ? order[idx - 1] : 'isha');
    };
    update();
    const interval = setInterval(update, 60_000);
    const handler = () => update();
    window.addEventListener('gz24:prefs', handler);
    return () => { clearInterval(interval); window.removeEventListener('gz24:prefs', handler); };
  }, [city, initialDate]);

  const rows = useMemo(() => Object.entries(times) as [Prayer, string][], [times]);

  return (
    <ul className="grid gap-2 rounded-3xl border border-[var(--color-border)] p-4 sm:p-6" role="list">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/prayer-times-table.tsx
git commit -m "feat: add prayer times table with live re-computation on pref changes"
```

---

## Task 11: Method selector + next prayer countdown

**Files:**
- Create: `src/components/method-selector.tsx`, `next-prayer-card.tsx`

- [ ] **Step 1: Create method-selector.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { prayerMethods } from '@/lib/prayer-methods';
import { readPrefs, writePrefs } from '@/lib/user-prefs';
import type { MethodKey } from '@/lib/prayer-methods';
import { Select } from './ui/select';

export function MethodSelector() {
  const [method, setMethod] = useState<MethodKey>('MWL');
  const [madhab, setMadhab] = useState<'Shafi' | 'Hanafi'>('Shafi');

  useEffect(() => {
    const p = readPrefs();
    setMethod(p.method);
    setMadhab(p.madhab);
  }, []);

  const updateMethod = (value: string) => {
    const v = value as MethodKey;
    writePrefs({ method: v });
    setMethod(v);
    window.dispatchEvent(new CustomEvent('gz24:prefs'));
  };
  const updateMadhab = (value: string) => {
    const v = value as 'Shafi' | 'Hanafi';
    writePrefs({ madhab: v });
    setMadhab(v);
    window.dispatchEvent(new CustomEvent('gz24:prefs'));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-[var(--color-muted)]">Methode:</span>
        <Select value={method} onChange={(e) => updateMethod(e.target.value)}>
          {prayerMethods.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </Select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-[var(--color-muted)]">Madhab:</span>
        <Select value={madhab} onChange={(e) => updateMadhab(e.target.value)}>
          <option value="Shafi">Shafi (früheres Asr)</option>
          <option value="Hanafi">Hanafi (späteres Asr)</option>
        </Select>
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Create next-prayer-card.tsx**

```tsx
'use client';
import { useEffect, useState } from 'react';
import type { City } from '@/data/cities';
import { computePrayerTimes, type Prayer } from '@/lib/adhan';
import { readPrefs } from '@/lib/user-prefs';
import { Card } from './ui/card';

const LABEL: Record<Prayer, string> = {
  fajr: 'Fajr', sunrise: 'Sonnenaufgang', dhuhr: 'Dhuhr',
  asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

export function NextPrayerCard({ city }: { city: City }) {
  const [info, setInfo] = useState<{ label: string; remaining: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const prefs = readPrefs();
      const now = new Date();
      const { getNext } = computePrayerTimes({
        lat: city.lat, lng: city.lng, timezone: city.timezone,
        method: prefs.method, madhab: prefs.madhab, date: now,
      });
      let next = getNext(now);
      if (!next) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        next = computePrayerTimes({
          lat: city.lat, lng: city.lng, timezone: city.timezone,
          method: prefs.method, madhab: prefs.madhab, date: tomorrow,
        }).getNext(tomorrow);
      }
      if (!next) return;
      const diffMs = next.time.getTime() - now.getTime();
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      setInfo({ label: LABEL[next.name], remaining: `${h}h ${m.toString().padStart(2, '0')}m` });
    };
    tick();
    const id = setInterval(tick, 1000);
    const onPrefs = () => tick();
    window.addEventListener('gz24:prefs', onPrefs);
    return () => { clearInterval(id); window.removeEventListener('gz24:prefs', onPrefs); };
  }, [city]);

  if (!info) return null;
  return (
    <Card className="border-sage/40 bg-sage/5">
      <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">Nächstes Gebet</p>
      <p className="mt-2 font-serif text-3xl">{info.label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums">in {info.remaining}</p>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/method-selector.tsx src/components/next-prayer-card.tsx
git commit -m "feat: add method/madhab selector and live next-prayer countdown"
```

---

## Task 12: FAQ accordion with per-city content

**Files:**
- Create: `src/components/faq-accordion.tsx`

- [ ] **Step 1: Implement component**

```tsx
import { Accordion } from './ui/accordion';
import type { City } from '@/data/cities';

export type CityFaq = { question: string; answer: string };

export function cityFaqs(city: City): CityFaq[] {
  return [
    {
      question: `Wann ist Fajr heute in ${city.name}?`,
      answer: `Die Fajr-Zeit in ${city.name} findest du oben in der Gebetszeiten-Tabelle. Sie wird nach der gewählten Berechnungsmethode live aktualisiert.`,
    },
    {
      question: `Welche Berechnungsmethode ist in Deutschland üblich?`,
      answer: `In Deutschland ist die Methode der Muslim World League (MWL) am weitesten verbreitet. Viele Moscheen mit türkischem Hintergrund verwenden alternativ die Diyanet-Methode.`,
    },
    {
      question: `Gibt es eine Monatsübersicht für ${city.name}?`,
      answer: `Ja — die Monatsansicht zeigt alle Gebetszeiten für den aktuellen Monat. Du erreichst sie über den Link oberhalb der Tabelle.`,
    },
    {
      question: `Wie ändere ich die Berechnungsmethode?`,
      answer: `Oberhalb der Tabelle findest du Auswahlmenüs für Methode und Madhab. Deine Auswahl wird lokal gespeichert und auf allen Stadt-Seiten angewendet.`,
    },
    {
      question: `Welcher Madhab wird für Asr verwendet?`,
      answer: `Standardmäßig zeigen wir Asr nach dem Schafi-Madhab an. Über die Auswahl kannst du zu Hanafi wechseln — dadurch verschiebt sich die Asr-Zeit nach hinten.`,
    },
  ];
}

export function FaqAccordion({ city }: { city: City }) {
  const faqs = cityFaqs(city);
  return <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/faq-accordion.tsx
git commit -m "feat: add per-city FAQ accordion with SEO-ready questions"
```

---

## Task 13: City page (`/[city]`)

**Files:**
- Create: `src/app/[city]/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { findCityBySlug, findNearbyCities } from '@/lib/cities';
import { computePrayerTimes } from '@/lib/adhan';
import { cityMetadata, placeJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { formatDateLong, formatTime } from '@/lib/utils';
import { formatHijri } from '@/lib/hijri';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PrayerTimesTable } from '@/components/prayer-times-table';
import { NextPrayerCard } from '@/components/next-prayer-card';
import { MethodSelector } from '@/components/method-selector';
import { FaqAccordion, cityFaqs } from '@/components/faq-accordion';
import { JsonLd } from '@/components/json-ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

type Params = { city: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) return {};
  return cityMetadata(city, new Date());
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) notFound();

  const date = new Date();
  const { times } = computePrayerTimes({
    lat: city.lat, lng: city.lng, timezone: city.timezone,
    method: 'MWL', madhab: 'Shafi', date,
  });
  const initialTimes = {
    fajr: formatTime(times.fajr),
    sunrise: formatTime(times.sunrise),
    dhuhr: formatTime(times.dhuhr),
    asr: formatTime(times.asr),
    maghrib: formatTime(times.maghrib),
    isha: formatTime(times.isha),
  };

  const nearby = findNearbyCities(city, 5);
  const faqs = cityFaqs(city);

  const ld = [
    placeJsonLd(city),
    breadcrumbJsonLd([{ name: 'Startseite', url: '/' }, { name: city.name, url: `/${city.slug}` }]),
    faqJsonLd(faqs),
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <JsonLd data={ld} />

      <Breadcrumbs items={[{ label: 'Startseite', href: '/' }, { label: city.name }]} />

      <header className="mt-6">
        <h1 className="font-serif text-4xl sm:text-5xl">Gebetszeiten in {city.name}</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Heute, {formatDateLong(date)} · {formatHijri(date)}
        </p>
      </header>

      <section className="mt-8"><NextPrayerCard city={city} /></section>

      <section className="mt-8">
        <PrayerTimesTable city={city} initialTimes={initialTimes} initialDate={date.toISOString()} />
        <div className="mt-4"><MethodSelector /></div>
        <div className="mt-6">
          <Link href={`/${city.slug}/monat`} className="text-sage underline-offset-4 hover:underline">
            Monatsansicht für {city.name} →
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[var(--color-border)] p-6 text-sm text-[var(--color-muted)]">
        <p>
          {city.name} liegt in {city.state} bei {city.lat.toFixed(3)}°N, {city.lng.toFixed(3)}°E
          und hat etwa {city.population.toLocaleString('de-DE')} Einwohner. Die angezeigten Gebetszeiten
          werden mit astronomischen Berechnungen ermittelt — Standard ist die Muslim World League-Methode,
          die in Deutschland und weiten Teilen Europas üblich ist.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Häufige Fragen</h2>
        <div className="mt-4"><FaqAccordion city={city} /></div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Gebetszeiten in der Nähe</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {nearby.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="block rounded-2xl border border-[var(--color-border)] p-4 hover:border-sage">
                <span className="font-serif text-lg">{c.name}</span>
                <span className="block text-xs text-[var(--color-muted)]">{c.state}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify build produces 100 static pages**

Run: `npm run build`
Expected: Output shows 100+ static routes; `out/berlin/index.html` exists with rendered prayer times.

- [ ] **Step 3: Commit**

```bash
git add src/app/[city]/page.tsx
git commit -m "feat: add city page with SSG for 100 cities, SEO, JSON-LD, FAQ, nearby"
```

---

## Task 14: Month view (`/[city]/monat`)

**Files:**
- Create: `src/app/[city]/monat/page.tsx`

- [ ] **Step 1: Implement the page**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { findCityBySlug } from '@/lib/cities';
import { computeMonth } from '@/lib/adhan';
import { formatTime } from '@/lib/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbJsonLd } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

type Params = { city: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) return {};
  const now = new Date();
  const monthName = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(now);
  return {
    title: `Gebetszeiten ${city.name} — ${monthName} Monatsansicht`,
    description: `Alle Gebetszeiten für ${city.name} im Monat ${monthName}. Druckbare Monatsübersicht mit Fajr, Sonnenaufgang, Dhuhr, Asr, Maghrib und Isha.`,
    alternates: { canonical: `/${city.slug}/monat` },
  };
}

export default async function MonthPage({ params }: { params: Promise<Params> }) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) notFound();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(now);

  const days = computeMonth({
    lat: city.lat, lng: city.lng, timezone: city.timezone,
    method: 'MWL', madhab: 'Shafi', year, month,
  });

  const ld = breadcrumbJsonLd([
    { name: 'Startseite', url: '/' },
    { name: city.name, url: `/${city.slug}` },
    { name: 'Monatsansicht', url: `/${city.slug}/monat` },
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ label: 'Startseite', href: '/' }, { label: city.name, href: `/${city.slug}` }, { label: 'Monatsansicht' }]} />

      <header className="mt-6">
        <h1 className="font-serif text-4xl">Gebetszeiten {city.name}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{monthName}</p>
      </header>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left">
              <th className="py-2 pr-3">Tag</th>
              <th className="py-2 pr-3">Fajr</th>
              <th className="py-2 pr-3">Sonnenaufgang</th>
              <th className="py-2 pr-3">Dhuhr</th>
              <th className="py-2 pr-3">Asr</th>
              <th className="py-2 pr-3">Maghrib</th>
              <th className="py-2 pr-3">Isha</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {days.map((d) => (
              <tr key={d.day} className="border-b border-[var(--color-border)]/60">
                <td className="py-2 pr-3 font-sans">{d.day}.</td>
                <td className="py-2 pr-3">{formatTime(d.times.fajr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.sunrise)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.dhuhr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.asr)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.maghrib)}</td>
                <td className="py-2 pr-3">{formatTime(d.times.isha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Berechnet mit Muslim World League (MWL), Madhab Shafi. <Link className="text-sage underline-offset-4 hover:underline" href={`/${city.slug}`}>Zurück zu {city.name}</Link>
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Add print CSS**

Append to `src/styles/globals.css`:
```css
@media print {
  header, footer, nav { display: none !important; }
  body { background: white; color: black; }
  table { font-size: 11pt; }
}
```

- [ ] **Step 3: Build & commit**

Run: `npm run build`
Expected: 200+ routes, including `out/berlin/monat/index.html`.

```bash
git add src/app/[city]/monat/page.tsx src/styles/globals.css
git commit -m "feat: add month view per city with print-optimized CSS"
```

---

## Task 15: City search + Homepage

**Files:**
- Create: `src/components/city-search.tsx`, `city-card.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create city-card.tsx**

```tsx
import Link from 'next/link';
import type { City } from '@/data/cities';

export function CityCard({ city }: { city: City }) {
  return (
    <Link
      href={`/${city.slug}`}
      className="group block rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-colors hover:border-sage"
    >
      <p className="font-serif text-2xl">{city.name}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">{city.state}</p>
      <p className="mt-4 text-sm text-sage group-hover:underline">Gebetszeiten ansehen →</p>
    </Link>
  );
}
```

- [ ] **Step 2: Create city-search.tsx**

```tsx
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { cities } from '@/data/cities';
import { searchCities } from '@/lib/cities';

export function CitySearch() {
  const [q, setQ] = useState('');
  const results = useMemo(() => (q ? searchCities(q).slice(0, 8) : []), [q]);

  return (
    <div className="relative">
      <label htmlFor="city-search" className="sr-only">Stadt suchen</label>
      <input
        id="city-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Stadt eingeben, z. B. Berlin"
        className="h-14 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-6 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        autoComplete="off"
      />
      {results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] py-2 shadow-xl">
          {results.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="flex items-baseline justify-between px-5 py-2 hover:bg-sage/10">
                <span>{c.name}</span>
                <span className="text-xs text-[var(--color-muted)]">{c.state}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">{cities.length} Städte in Deutschland abgedeckt.</p>
    </div>
  );
}
```

- [ ] **Step 3: Implement homepage src/app/page.tsx**

```tsx
import type { Metadata } from 'next';
import { cities } from '@/data/cities';
import { CitySearch } from '@/components/city-search';
import { CityCard } from '@/components/city-card';
import { formatDateLong } from '@/lib/utils';
import { formatHijri } from '@/lib/hijri';

export const metadata: Metadata = {
  title: 'Gebetszeiten24 — Gebetszeiten für alle Städte in Deutschland',
  description: 'Genaue Gebetszeiten für die 100 größten Städte Deutschlands. Alle Berechnungsmethoden, Monatsansicht, werbefrei und DSGVO-konform.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const today = new Date();
  const featured = cities.slice(0, 12);

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 text-sage opacity-[0.04]" aria-hidden>
        <div className="h-full w-full" style={{ backgroundImage: 'url(/pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '160px' }} />
      </div>

      <section className="relative text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">Gebetszeiten für Deutschland</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
          Gebetszeiten für deine Stadt —<br />
          präzise, werbefrei, DSGVO-konform.
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          {formatDateLong(today)} · {formatHijri(today)}
        </p>
      </section>

      <section className="relative mt-10"><CitySearch /></section>

      <section className="relative mt-16">
        <h2 className="font-serif text-2xl">Beliebte Städte</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => <CityCard key={c.slug} city={c} />)}
        </div>
      </section>

      <section className="relative mt-16 rounded-3xl border border-[var(--color-border)] p-8 text-[var(--color-muted)]">
        <h2 className="font-serif text-2xl text-[var(--color-foreground)]">Über Gebetszeiten24</h2>
        <p className="mt-4">
          Gebetszeiten24 berechnet die fünf täglichen Gebetszeiten nach astronomischen Verfahren
          und deckt alle in Deutschland gebräuchlichen Methoden ab — darunter Muslim World League,
          Diyanet (Türkei), Ägyptische Behörde, ISNA und weitere. Für jede Stadt erhältst du Fajr,
          Sonnenaufgang, Dhuhr, Asr, Maghrib und Isha in Ortszeit.
        </p>
        <p className="mt-4">
          Die Berechnung erfolgt vollständig transparent mit der Open-Source-Bibliothek adhan.
          Wir zeigen keine Werbung, setzen keine Tracking-Cookies und arbeiten DSGVO-konform.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Build & commit**

Run: `npm run build`
Expected: Homepage renders with search and city grid.

```bash
git add src/app/page.tsx src/components/city-search.tsx src/components/city-card.tsx
git commit -m "feat: add homepage with city search, featured grid, pattern background"
```

---

## Task 16: Calculation methods page

**Files:**
- Create: `src/app/berechnungsmethoden/page.tsx`

- [ ] **Step 1: Implement page**

```tsx
import type { Metadata } from 'next';
import { prayerMethods } from '@/lib/prayer-methods';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Berechnungsmethoden für Gebetszeiten',
  description: 'Überblick über alle 13 Methoden zur Berechnung der Gebetszeiten: MWL, ISNA, Diyanet, Umm al-Qura und mehr. Inklusive Fajr- und Isha-Winkel.',
  alternates: { canonical: '/berechnungsmethoden' },
};

export default function MethodsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs items={[{ label: 'Startseite', href: '/' }, { label: 'Berechnungsmethoden' }]} />
      <header className="mt-6">
        <h1 className="font-serif text-4xl">Berechnungsmethoden für Gebetszeiten</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Die Gebetszeiten hängen von der gewählten Methode ab — vor allem die Fajr- und Isha-Winkel variieren.
          Unten findest du eine Übersicht aller 13 unterstützten Methoden.
        </p>
      </header>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {prayerMethods.map((m) => (
          <Card key={m.key}>
            <h2 className="font-serif text-xl">{m.label}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{m.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-[var(--color-muted)]">Fajr-Winkel</dt>
              <dd className="font-mono">{m.fajrAngle}°</dd>
              <dt className="text-[var(--color-muted)]">Isha-Winkel</dt>
              <dd className="font-mono">{m.ishaAngle === 0 ? '90 Min nach Maghrib' : `${m.ishaAngle}°`}</dd>
            </dl>
          </Card>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/berechnungsmethoden/page.tsx
git commit -m "feat: add calculation methods explainer page"
```

---

## Task 17: Legal pages (Impressum, Datenschutz) + 404

**Files:**
- Create: `src/app/impressum/page.tsx`, `datenschutz/page.tsx`, `not-found.tsx`

- [ ] **Step 1: Create impressum/page.tsx (placeholder for real data)**

```tsx
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum gemäß § 5 TMG.',
  alternates: { canonical: '/impressum' },
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs items={[{ label: 'Startseite', href: '/' }, { label: 'Impressum' }]} />
      <h1 className="mt-6 font-serif text-4xl">Impressum</h1>
      <section className="mt-6 space-y-4 text-sm">
        <p><strong>Angaben gemäß § 5 TMG</strong></p>
        <p>
          [Name des Betreibers]<br />
          [Straße und Hausnummer]<br />
          [PLZ, Ort]<br />
          Deutschland
        </p>
        <p><strong>Kontakt:</strong><br />E-Mail: [E-Mail-Adresse]</p>
        <p><strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />[Name, Adresse wie oben]</p>
        <p className="text-[var(--color-muted)]">
          Haftungsausschluss: Trotz sorgfältiger Prüfung der Inhalte übernehmen wir keine Haftung für die Richtigkeit,
          Vollständigkeit und Aktualität der berechneten Gebetszeiten. Für konkrete religiöse Fragen wende dich bitte
          an die zuständige Moschee oder Gelehrten.
        </p>
      </section>
    </main>
  );
}
```

**Note for implementer:** The `[...]` placeholders must be replaced with real operator details before public launch. This is tracked as a post-launch checklist item, not a TODO in code.

- [ ] **Step 2: Create datenschutz/page.tsx**

```tsx
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung für Gebetszeiten24.',
  alternates: { canonical: '/datenschutz' },
  robots: { index: false, follow: true },
};

export default function Datenschutz() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumbs items={[{ label: 'Startseite', href: '/' }, { label: 'Datenschutz' }]} />
      <h1 className="mt-6 font-serif text-4xl">Datenschutzerklärung</h1>
      <section className="mt-6 space-y-4 text-sm">
        <h2 className="font-serif text-xl">1. Verarbeitete Daten</h2>
        <p>
          Beim Aufruf dieser Website werden durch den Hosting-Provider Server-Logs erstellt (IP-Adresse, Zeitpunkt,
          aufgerufene Seite, User-Agent). Diese Daten werden ausschließlich zur Gewährleistung eines sicheren Betriebs
          verarbeitet und nach 7 Tagen gelöscht.
        </p>
        <h2 className="font-serif text-xl">2. Cookies</h2>
        <p>
          Wir verwenden keine Tracking-Cookies. Deine Einstellungen (gewählte Berechnungsmethode, Farbschema)
          werden ausschließlich lokal in deinem Browser (localStorage) gespeichert und nicht an uns übertragen.
        </p>
        <h2 className="font-serif text-xl">3. Analyse</h2>
        <p>
          Für Reichweitenmessung setzen wir Plausible Analytics ein — ein DSGVO-konformes Werkzeug, das keine
          personenbezogenen Daten, keine Cookies und kein Cross-Site-Tracking verwendet.
        </p>
        <h2 className="font-serif text-xl">4. Rechte der Nutzer</h2>
        <p>
          Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner
          personenbezogenen Daten. Wende dich hierfür an die im Impressum angegebene E-Mail-Adresse.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Create not-found.tsx**

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-[var(--color-muted)]">404</p>
      <h1 className="mt-2 font-serif text-4xl">Seite nicht gefunden</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Die angeforderte Seite existiert nicht. Vielleicht suchst du deine Stadt?
      </p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-sage px-6 py-3 text-cream hover:bg-sage-dark">Zur Startseite</Link>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/impressum src/app/datenschutz src/app/not-found.tsx
git commit -m "feat: add legal pages (impressum, datenschutz) and 404"
```

---

## Task 18: Sitemap & robots.txt

**Files:**
- Create: `src/app/sitemap.ts`, `robots.ts`

- [ ] **Step 1: Create sitemap.ts**

```ts
import type { MetadataRoute } from 'next';
import { cities } from '@/data/cities';

const BASE = 'https://gebetszeiten24.de';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/berechnungsmethoden`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
  const cityRoutes: MetadataRoute.Sitemap = cities.flatMap((c) => [
    { url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/${c.slug}/monat`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]);
  return [...staticRoutes, ...cityRoutes];
}
```

- [ ] **Step 2: Create robots.ts**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://gebetszeiten24.de/sitemap.xml',
    host: 'https://gebetszeiten24.de',
  };
}
```

Legal pages (Impressum, Datenschutz) are kept crawlable but `noindex` via page-level metadata — that is the correct pattern for German legal pages (they need to be discoverable via the footer link but not indexed competing in search).

- [ ] **Step 3: Build & verify**

Run: `npm run build`
Expected: `out/sitemap.xml` and `out/robots.txt` exist and contain all routes.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add dynamic sitemap.xml and robots.txt"
```

---

## Task 19: Per-city Open Graph images

**Files:**
- Create: `src/app/[city]/opengraph-image.tsx`

- [ ] **Step 1: Implement OG image route**

```tsx
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

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = findCityBySlug(slug);
  if (!city) return new ImageResponse(<div>Not found</div>, size);

  const now = new Date();
  const { times } = computePrayerTimes({
    lat: city.lat, lng: city.lng, timezone: city.timezone,
    method: 'MWL', madhab: 'Shafi', date: now,
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
          <div style={{ fontSize: 28, color: '#5c6b5a', letterSpacing: 4, textTransform: 'uppercase' }}>
            Gebetszeiten24
          </div>
          <div style={{ fontSize: 96, fontWeight: 400, marginTop: 16, lineHeight: 1 }}>
            Gebetszeiten in {city.name}
          </div>
          <div style={{ fontSize: 28, color: '#6b6b6b', marginTop: 16 }}>
            {new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 32 }}>
          <span>Fajr {formatTime(times.fajr)}</span>
          <span>Dhuhr {formatTime(times.dhuhr)}</span>
          <span>Maghrib {formatTime(times.maghrib)}</span>
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Build & verify**

Run: `npm run build`
Expected: 100 `.png` OG images generated per city, referenced from each city's `<meta property="og:image">`.

- [ ] **Step 3: Commit**

```bash
git add src/app/[city]/opengraph-image.tsx
git commit -m "feat: generate per-city Open Graph images at build time"
```

---

## Task 20: Pattern SVG + favicons

**Files:**
- Create: `public/pattern.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`

- [ ] **Step 1: Create public/pattern.svg**

A tileable 8-point star pattern. Save as `public/pattern.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <pattern id="p" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="currentColor" stroke-width="0.5">
        <path d="M50 10 L64 36 L90 36 L70 54 L78 80 L50 66 L22 80 L30 54 L10 36 L36 36 Z"/>
      </g>
    </pattern>
  </defs>
  <rect width="200" height="200" fill="url(#p)"/>
</svg>
```

- [ ] **Step 2: Add favicon + apple-touch-icon**

Create `favicon.ico` (32×32) and `apple-touch-icon.png` (180×180). Design: cream background, sage "G24" monogram in Instrument Serif. Any design tool works; commit binaries. If you lack tooling immediately, ship a minimal placeholder and track a real design as a post-launch task.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "feat: add islamic pattern SVG and favicon set"
```

---

## Task 21: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create ci.yml**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v4
        if: github.ref == 'refs/heads/main'
        with:
          name: static-site
          path: out
          retention-days: 7
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint + typecheck + test + build workflow"
```

---

## Task 22: Daily rebuild workflow

**Files:**
- Create: `.github/workflows/daily-rebuild.yml`

- [ ] **Step 1: Create workflow**

```yaml
name: Daily Rebuild
on:
  schedule:
    - cron: '5 0 * * *'
  workflow_dispatch:

jobs:
  trigger-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger host deploy webhook
        run: |
          if [ -z "${{ secrets.DEPLOY_HOOK_URL }}" ]; then
            echo "DEPLOY_HOOK_URL secret not set — skipping"
            exit 0
          fi
          curl -fsS -X POST "${{ secrets.DEPLOY_HOOK_URL }}"
```

Once the host (Cloudflare Pages or Vercel) is wired up, add a repo secret `DEPLOY_HOOK_URL` pointing to the host's deploy webhook. Until then, the workflow no-ops safely.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/daily-rebuild.yml
git commit -m "ci: add daily rebuild cron workflow"
```

---

## Task 23: README and operational docs

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# Gebetszeiten24

Static prayer-times website for the top 100 German cities.
Live: https://gebetszeiten24.de

## Stack

- Next.js 15 (App Router, `output: 'export'`)
- TypeScript strict
- Tailwind CSS v4 + custom UI primitives
- `adhan` for prayer time calculation (13 methods + Madhab)
- Vitest for tests
- Plausible Analytics (DSGVO-konform)

## Development

```sh
npm install
npm run dev          # http://localhost:3000
npm run test         # unit tests
npm run build        # static export to ./out
```

## Adding a city

1. Append to `src/data/cities.ts` (keep slug ASCII-lowercase, unique).
2. Update tests in `tests/cities.test.ts` to reflect new count.
3. `npm run build` — a new `/[slug]/` route is generated.

## Deployment

Any static host works. Recommended:
- Cloudflare Pages — point to `out/` directory.
- Vercel — auto-detects Next.js static export.

Set repo secret `DEPLOY_HOOK_URL` to enable nightly rebuilds.

## Project structure

See `docs/superpowers/specs/2026-04-17-gebetszeiten24-design.md` for the full design spec.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with stack, dev workflow, deployment notes"
```

---

## Task 24: Plausible Analytics integration (production only)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Plausible script conditionally**

Modify `src/app/layout.tsx` to include Plausible only in production. Add a `<head>` block inside the `<html>`:

```tsx
<html lang="de" className={`${sans.variable} ${serif.variable}`}>
  <head>
    {process.env.NODE_ENV === 'production' && (
      <script defer data-domain="gebetszeiten24.de" src="https://plausible.io/js/script.js" />
    )}
  </head>
  <body className="flex min-h-screen flex-col font-sans antialiased">
    <Header />
    <div className="flex-1">{children}</div>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: integrate Plausible analytics in production only"
```

---

## Task 25: Final QA

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `out/` contains:
- `index.html` (homepage)
- 100 `{slug}/index.html`
- 100 `{slug}/monat/index.html`
- 100 per-city OG images
- `berechnungsmethoden/index.html`, `impressum/index.html`, `datenschutz/index.html`, `404.html`
- `sitemap.xml`, `robots.txt`

- [ ] **Step 2: Tests green**

Run: `npm run lint && npm run typecheck && npm test`
Expected: All pass.

- [ ] **Step 3: Manual Lighthouse check**

Serve the `out/` directory locally:
```bash
npx serve out -l 4000
```
Open `http://localhost:4000/berlin` in Chrome DevTools → Lighthouse → run for Desktop + Mobile.

Targets:
- Performance ≥ 95
- Accessibility ≥ 95
- SEO = 100
- Best Practices ≥ 95

If targets are missed, diagnose common causes: missing font preload, missing `alt` attributes, color contrast on pattern bg. Fix iteratively, then re-run.

- [ ] **Step 4: Validate JSON-LD**

For 3 sample pages (homepage, `/berlin`, `/berlin/monat`):
1. Serve locally with `npx serve out`.
2. Paste the rendered HTML into https://validator.schema.org/
3. Confirm no errors/warnings on `Place`, `FAQPage`, `BreadcrumbList`.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "chore: QA fixes for lighthouse and schema validation"
```

- [ ] **Step 6: Tag v0.1.0**

```bash
git tag -a v0.1.0 -m "v0.1.0: initial launch-ready build"
```

---

## Post-Launch Checklist (documented, not a task)

Once the domain `gebetszeiten24.de` is registered and DNS is pointed at the host:

1. Connect GitHub repo to Cloudflare Pages (or Vercel).
2. Configure build: `npm run build`, output dir: `out`, Node 20.
3. Set env var `NODE_ENV=production` (auto on most hosts).
4. In the host dashboard, create a deploy hook; add as GitHub secret `DEPLOY_HOOK_URL`.
5. Verify `https://gebetszeiten24.de/sitemap.xml` is accessible.
6. Submit sitemap in Google Search Console.
7. Set up Plausible site for `gebetszeiten24.de`.
8. Replace placeholder text in `src/app/impressum/page.tsx` with real operator data.
9. Monitor Search Console for indexation progress over 2–4 weeks.
