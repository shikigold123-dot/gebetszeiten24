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
      <label htmlFor="city-search" className="sr-only">
        Stadt suchen
      </label>
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
              <Link
                href={`/${c.slug}`}
                className="flex items-baseline justify-between px-5 py-2 hover:bg-sage/10"
              >
                <span>{c.name}</span>
                <span className="text-xs text-[var(--color-muted)]">{c.state}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {cities.length} Städte in Deutschland abgedeckt.
      </p>
    </div>
  );
}
