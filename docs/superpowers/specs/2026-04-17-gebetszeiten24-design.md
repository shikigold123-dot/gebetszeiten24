# Gebetszeiten24.de — Design Spec

**Datum:** 2026-04-17
**Status:** Approved brainstorming — ready for implementation plan
**Domain:** `gebetszeiten24.de` (noch nicht registriert)

---

## 1. Zielsetzung

Eine deutschsprachige Gebetszeiten-Website für die Top 100 Städte Deutschlands, hochwertig designt, vollständig SEO-optimiert, host-agnostisch deploybar (Vercel oder Cloudflare Pages). Der Fokus liegt auf programmatischem SEO: Wer in Deutschland "gebetszeiten berlin" o. Ä. sucht, soll die jeweilige Stadtseite von Gebetszeiten24 prominent angezeigt bekommen.

**MVP-Scope (v1):** Nur Gebetszeiten-Anzeige pro Stadt, alle relevanten Berechnungsmethoden umschaltbar, Monatsansicht, Startseite mit Städtesuche. Explizit **nicht** in v1: Qibla-Kompass, Hijri-Kalender-Seiten, Ramadan-Spezialansicht, Moschee-Finder, Blog, User-Accounts, Push-Benachrichtigungen, API, mehrsprachige Versionen.

## 2. Tech-Stack

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript strict** | Beste Option für programmatisches SEO (SSG), großes Ökosystem |
| Build-Modus | **`output: 'export'` (Static Export)** | Reines Static HTML → host-agnostisch (Vercel, Cloudflare Pages, jeder CDN) |
| Styling | **Tailwind CSS v4 + shadcn/ui** | Schnell, konsistent, headless |
| Gebetszeiten-Berechnung | **`adhan-js`** (Library, keine API) | Offline-fähig, keine Rate-Limits, 13 Methoden + Madhab-Support |
| Hijri-Konvertierung | `hijri-converter` npm-Paket | Geprüft, gepflegt, klein; nur Anzeige des aktuellen Hijri-Datums |
| Fonts | `Instrument Serif` (Headings), `Inter` (Body) via `next/font` | Elegant + performant, self-hosted |
| Analytics | **Plausible** (self-hosted oder SaaS) | DSGVO-konform ohne Cookie-Banner |
| SEO-Monitoring | Google Search Console | Standard |
| Daily Rebuild | GitHub Actions Cron (00:00 UTC) → Deploy Webhook | Host-agnostisch, einfach |
| Tests | Vitest + Testing Library | Modern, schnell, Next.js-kompatibel |
| Linting | ESLint + Prettier (Next.js-Defaults) | Standard |

**Wichtig — keine klassische ISR:** Da Cloudflare Pages klassisches Next.js-ISR nicht nativ unterstützt, fahren wir vollstatisch. Tägliche Aktualität des "Heute"-Datums kommt über einen Cron-getriggerten Rebuild. Im Frontend wird "Heute" zusätzlich clientseitig gegen `new Date()` validiert; falls der User nach Mitternacht vor dem nächsten Rebuild lädt, zeigen wir dezent einen Hinweis + JS-basierten Fallback (berechnet adhan-js live im Browser aus den Koordinaten).

## 3. URL-Struktur

```
/                             Startseite (Übersicht + Städtesuche)
/[city]                       z.B. /berlin, /muenchen, /hamburg, /koeln
/[city]/monat                 Monatsansicht pro Stadt
/berechnungsmethoden          Erklärung aller 13 Methoden
/impressum
/datenschutz
/sitemap.xml                  Auto-generiert
/robots.txt
```

**Rationale flache URL:** `gebetszeiten` steht bereits im Domainnamen — `/gebetszeiten/berlin` wäre Keyword-Spam. Flach + keyword-fokussiert ist SEO-optimal. Stadt-Slugs sind kleingeschrieben, ASCII-normalisiert (`muenchen`, `koeln`, nicht `münchen`, `köln`).

## 4. SEO-Strategie

### Pro Stadt-Seite
- **`<title>`:** `Gebetszeiten Berlin – Heute {Datum}, {Hijri-Datum} | Gebetszeiten24`
- **`<meta description>`:** Dynamisch: `Genaue Gebetszeiten für Berlin am {Datum}: Fajr {x}, Dhuhr {y}, … Alle Berechnungsmethoden. Monatsansicht verfügbar.`
- **H1:** `Gebetszeiten in Berlin`
- **Content (einzigartig pro Stadt, ~80–120 Wörter):** Einleitung erwähnt Stadt, Bundesland, Koordinaten, Einwohnerzahl, kurzer Hinweis zu gewählter Default-Methode (MWL). Dynamisch aus Template + Stadt-Daten generiert, mit Variation um Duplicate-Content zu vermeiden.
- **FAQ-Accordion** (SEO + Schema): 4–6 stadtspezifische Fragen, z.B. "Wann ist Fajr heute in Berlin?", "Welche Berechnungsmethode ist in Deutschland üblich?", "Wo finde ich die Monatsansicht für Berlin?".
- **Schema.org JSON-LD:** `Place` (mit Geo-Koordinaten) + `FAQPage` + `BreadcrumbList`. Optional `Event` für Gebetszeit-Events — wird in v1 geprüft, aber nur eingebaut wenn Schema-Validator keine Warnings wirft.
- **Open Graph / Twitter Cards:** Pro Stadt eigenes OG-Image (1200×630), zur Build-Zeit via `opengraph-image.tsx` generiert — zeigt Stadtname, heutiges Datum, Gebetszeiten-Vorschau, Gebetszeiten24-Branding.
- **Canonical:** `https://gebetszeiten24.de/berlin`
- **`hreflang`:** `de-DE` gesetzt (vorbereitet für spätere Sprachen ohne Breaking-Changes)

### Site-weit
- **`sitemap.xml`:** Auto-generiert über `app/sitemap.ts`, enthält alle Städte + Monatsansichten + statische Seiten mit `lastmod`
- **`robots.txt`:** Erlaubt alles außer `/api` (falls später nötig), verweist auf Sitemap
- **Core Web Vitals Ziele:** LCP < 1.5s, CLS < 0.05, INP < 200ms. SSG + `next/font` Preload + `next/image` + kein Client-JS für initial Render schafft das locker.
- **Lighthouse-Ziele:** Performance ≥95, SEO = 100, Accessibility ≥95, Best Practices ≥95
- **Interne Verlinkung:** Footer mit Alphabet-Liste aller 100 Städte → Crawler findet alles in 1 Klick. Stadtseite verlinkt 3–5 nahegelegene Städte ("Gebetszeiten in der Nähe") → semantische Cluster.

## 5. Daten-Modell

### Städte (`src/data/cities.ts`)
```ts
type City = {
  slug: string;           // "berlin", "muenchen"
  name: string;           // "Berlin", "München"
  state: string;          // "Berlin", "Bayern"
  lat: number;            // 52.5200
  lng: number;            // 13.4050
  population: number;
  timezone: "Europe/Berlin"; // für alle 100 gleich
};
export const cities: City[] = [ /* 100 Einträge, handkuratiert */ ];
```

**Quelle:** Top 100 deutsche Städte nach Einwohnerzahl, Liste erstellt aus Wikipedia/Destatis + Koordinaten aus OpenStreetMap (Nominatim) oder GeoNames. Einmal kuratieren, als JSON committen.

### Berechnungsmethoden (`src/lib/prayer-methods.ts`)
```ts
type MethodKey =
  | 'MWL' | 'ISNA' | 'Egyptian' | 'Karachi' | 'UmmAlQura'
  | 'Dubai' | 'Qatar' | 'Kuwait' | 'MoonsightingCommittee'
  | 'Singapore' | 'Turkey' | 'Tehran' | 'NorthAmerica';

type MethodInfo = {
  key: MethodKey;
  label: string;           // deutscher Name
  description: string;     // kurze Erklärung
  fajrAngle: number;
  ishaAngle: number;
};
```

Default: **MWL (Muslim World League)** — in Deutschland am gebräuchlichsten. Madhab-Default: **Shafi** (früheres Asr).

### User-Präferenzen (localStorage, kein Account)
```ts
type UserPrefs = {
  method: MethodKey;
  madhab: 'Shafi' | 'Hanafi';
  theme: 'light' | 'dark' | 'system';
  lastCity?: string;       // für "Zurück zu …"-Hinweis
};
```

## 6. Seiten-Layout

### Startseite `/`
- **Hero:** Gregorianisches Datum + Hijri-Datum, ein großes "Nächstes Gebet in {Stadt}"-Widget (nutzt `navigator.geolocation` mit Permission-Prompt; Fallback: User wählt Stadt aus Dropdown)
- **Städte-Suche:** Combobox mit Autocomplete über alle 100 Städte
- **Städte-Grid:** 12 beliebteste Städte als Kacheln mit Mini-Preview (Fajr/Maghrib)
- **Intro-Text (~150 Wörter):** Einmaliger, einzigartiger Content über Gebetszeiten in Deutschland, Berechnungsmethoden-Kurzinfo, Verweis auf die Methoden-Erklärungsseite
- **Footer:** Alphabetische Liste aller 100 Städte, Navigation, Impressum/Datenschutz-Links

### Stadt-Seite `/[city]`
- **Breadcrumb:** Startseite › Berlin
- **H1** + Datumsanzeige (Gregorianisch + Hijri)
- **"Nächstes Gebet"-Card** mit Live-Countdown (Client-JS)
- **Gebetszeiten-Tabelle:** Fajr / Sunrise / Dhuhr / Asr / Maghrib / Isha, aktuelles Gebet visuell hervorgehoben
- **Berechnungsmethode + Madhab Selector** — ändert sich clientseitig, Zeiten werden live neu berechnet (adhan-js läuft im Browser)
- **Link zur Monatsansicht**
- **Intro-Absatz** (einzigartig pro Stadt, SEO)
- **FAQ-Accordion**
- **"Gebetszeiten in der Nähe":** 3–5 nächstgelegene Städte aus dem Datensatz

### Monatsansicht `/[city]/monat`
- Tabelle mit allen Tagen des aktuellen Monats
- Druckoptimiertes CSS (`@media print`)
- Navigation zu vorigen/nächsten Monaten (optional, v1 nur aktueller Monat)

### `/berechnungsmethoden`
- Pro Methode eine Card mit Name, Winkel (Fajr/Isha), Verbreitung, Empfehlung
- Wird durch interne Verlinkung zu einem sekundären SEO-Landingpage

### Impressum & Datenschutz
- Rechtlich korrekt (deutsche Gesetze), Plausible-Hinweis, kein Cookie-Banner dank DSGVO-konformem Analytics

## 7. Design-System

**Farbpalette (Light Mode):**
- Hintergrund: `#f5f3ee` (Cream)
- Primary: `#5c6b5a` (Sage-Green)
- Accent: `#c9a961` (Gold, sparsam)
- Text: `#1a1a1a`
- Muted: `#6b6b6b`
- Border: `#e5e2dd`

**Farbpalette (Dark Mode):**
- Hintergrund: `#1a2420` (Tiefes Sage-Dark)
- Primary: `#8fa08c`
- Accent: `#d4b876`
- Text: `#f5f3ee`

**Typografie:**
- Headings: `Instrument Serif`, Regular, tracking-tight
- Body/UI: `Inter`, 400/500/600
- Zahlen (Gebetszeiten): `Inter` tabular-nums, große Größe (~2rem auf Mobile, 2.5rem Desktop)

**Geometrie:**
- Ein subtiles SVG-Pattern (islamische Geometrie, z.B. 8-Punkt-Stern-Tessellation), opacity ~0.03–0.05, als Hero-Background
- Wird als eine SVG-Datei in `public/` eingebunden, sauber optimiert

**Motion:**
- Sanfte Fade-Ins (150ms), Countdown pulsiert sehr dezent, Method-Selector-Wechsel mit kurzem Cross-Fade. Kein aggressives Scroll-Jacking, keine Parallax.

**Mobile-first:**
- Breakpoints: 640px / 768px / 1024px
- Auf Mobile wird die Gebetszeiten-Tabelle zu großen, gut antippbaren Cards
- Min-Tap-Target 44×44px

## 8. Build-Pipeline

**Build-Zeit-Output:**
- `/` (1 Seite)
- `/[city]` × 100 (100 Seiten)
- `/[city]/monat` × 100 (100 Seiten)
- `/berechnungsmethoden`, `/impressum`, `/datenschutz` (3 Seiten)
- `/[city]/opengraph-image` × 100 (100 OG-Bilder)
- `sitemap.xml`, `robots.txt`

**Gesamt: ~305 statische Dateien, Build-Zeit-Ziel: < 60 Sekunden.**

**Tägliche Aktualisierung:**
GitHub Actions Workflow (`.github/workflows/daily-rebuild.yml`) mit `schedule: '0 0 * * *'` triggert Deploy Hook des Hosters. Fallback client-side: beim Pageload wird geprüft, ob das statisch gerenderte Datum dem lokalen Datum entspricht — falls nicht, rechnet JS live neu und ersetzt die Werte.

## 9. Qualitätssicherung

**Tests:**
- Unit-Tests für `src/lib/adhan.ts` (Wrapper): Vergleich gegen Referenzwerte (z.B. Diyanet-Veröffentlichungen für Berlin/München an 3–4 Stichtagen), Toleranz ±1 Minute
- Unit-Tests für `src/lib/hijri.ts`
- Component-Tests für `PrayerTimesTable`, `MethodSelector`
- SEO-Smoke-Test: validiert generierte `<title>`/`<meta>`/JSON-LD pro Route-Typ

**Manuelle Checks vor Launch:**
- Lighthouse-Run auf 5 zufälligen Stadtseiten + Startseite
- Schema.org-Validator auf allen Seitentypen
- Rich Results Test (Google)
- Mobile-Darstellung auf echten Geräten (iOS Safari, Android Chrome)
- Search Console Sitemap-Einreichung

**CI-Pipeline (GitHub Actions):**
- Lint + Typecheck + Tests auf PR
- Build-Check auf main

## 10. Out-of-Scope (explizit ausgeklammert für v1)

| Feature | Warum ausgelassen |
|---|---|
| Qibla-Kompass | User hat v1 als minimal definiert; später leicht ergänzbar |
| Hijri-Kalender (eigene Seiten) | Nur Anzeige im Datum, keine dedizierte Seite |
| Ramadan Imsak/Iftar-Ansicht | Fajr/Maghrib werden bereits angezeigt; spezielle Ansicht v2 |
| Moschee-Finder | Benötigt eigenen Datensatz, separate Initiative |
| Blog/Ratgeber | v2, wenn organische Rankings etabliert sind |
| User-Accounts / Sync | localStorage reicht für v1 |
| Push-Notifications | Benötigt PWA + Service Worker, zu komplex für v1 |
| Öffentliche API / Widget | v2 |
| Mehrsprachigkeit (Türkisch, Arabisch) | Architektur berücksichtigt hreflang, Content kommt später |
| Mehr als 100 Städte | v1 fokussiert — bei guter Performance v2 auf ~2.000 |

## 11. Projekt-Struktur

```
gebetszeiten_24/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── daily-rebuild.yml
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-17-gebetszeiten24-design.md
├── public/
│   ├── pattern.svg
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [city]/
│   │   │   ├── page.tsx
│   │   │   ├── monat/page.tsx
│   │   │   └── opengraph-image.tsx
│   │   ├── berechnungsmethoden/page.tsx
│   │   ├── impressum/page.tsx
│   │   ├── datenschutz/page.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── prayer-times-table.tsx
│   │   ├── next-prayer-card.tsx
│   │   ├── method-selector.tsx
│   │   ├── city-search.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/                    (shadcn/ui primitives)
│   ├── lib/
│   │   ├── adhan.ts
│   │   ├── prayer-methods.ts
│   │   ├── hijri.ts
│   │   ├── seo.ts
│   │   └── utils.ts
│   ├── data/
│   │   └── cities.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── adhan.test.ts
│   ├── hijri.test.ts
│   └── components/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

## 12. Offene Punkte (vor Implementierung zu klären, aber nicht blockend)

1. **Domain-Registrierung:** User registriert `gebetszeiten24.de` separat. DNS/Deployment-Setup erfolgt wenn Domain verfügbar.
2. **Impressum-Inhalte:** User muss Impressums-Angaben (Name, Adresse, E-Mail) bereitstellen — wird während Implementierung angefragt.
3. **Analytics-Domain:** Plausible self-hosted oder SaaS? SaaS ist einfacher für Start. Wird vor Launch final entschieden.
4. **GitHub-Repo:** Öffentlich oder privat? Empfehlung: privat für v1.
