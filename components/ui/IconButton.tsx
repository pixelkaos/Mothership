import React from 'react';
import type { ComponentProps } from 'react';

const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus-visible:[box-shadow:var(--ring-outline)] disabled:cursor-not-allowed disabled:opacity-60 rounded-[var(--radius-md)] duration-[var(--duration-1)] ease-standard';

const variants = {
  ghost: 'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:bg-[var(--color-primary)]/20',
};

const sizes = {
  sm: 'w-[var(--space-6)] h-[var(--space-6)]',
  md: 'w-[var(--space-7)] h-[var(--space-7)]',
  lg: 'w-[var(--space-8)] h-[var(--space-8)]',
};

type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode; // SVG icon
  'aria-label': string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  children,
  className,
  ...rest
}) => {
  const combinedClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={combinedClasses} {...rest}>
      {children}
    </button>
  );
};