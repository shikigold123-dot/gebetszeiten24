'use client';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AccordionItem = { question: string; answer: ReactNode };

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div
      className={cn(
        'divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]',
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left font-medium hover:bg-sage/5"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.question}</span>
            <span
              aria-hidden
              className={cn('transition-transform', open === i && 'rotate-45')}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-[var(--color-muted)]">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
