import Link from 'next/link';
import { cities } from '@/data/cities';

export function Footer() {
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-2xl">Alle Städte</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Gebetszeiten für die 100 größten Städte Deutschlands.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="hover:text-sage">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-6 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)]">
          <Link href="/impressum" className="hover:text-sage">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-sage">
            Datenschutz
          </Link>
          <Link href="/berechnungsmethoden" className="hover:text-sage">
            Berechnungsmethoden
          </Link>
          <span className="ml-auto">&copy; {new Date().getFullYear()} Gebetszeiten24</span>
        </div>
      </div>
    </footer>
  );
}
