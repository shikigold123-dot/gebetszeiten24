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
