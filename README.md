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
