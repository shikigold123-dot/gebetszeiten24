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
      <p className="mt-4 text-sm text-sage group-hover:underline">
        Gebetszeiten ansehen →
      </p>
    </Link>
  );
}
