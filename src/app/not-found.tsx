import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="font-mono text-sm text-[var(--color-muted)]">404</p>
      <h1 className="mt-2 font-serif text-4xl">Seite nicht gefunden</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Die angeforderte Seite existiert nicht. Vielleicht suchst du deine Stadt?
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-sage px-6 py-3 text-cream hover:bg-sage-dark"
      >
        Zur Startseite
      </Link>
    </main>
  );
}
