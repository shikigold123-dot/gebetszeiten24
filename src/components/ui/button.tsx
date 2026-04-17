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
