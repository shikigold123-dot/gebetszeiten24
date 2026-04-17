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
          <Link href="/berechnungsmethoden" className="hover:text-sage">
            Methoden
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
