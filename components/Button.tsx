import React from 'react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

const baseClasses = 'inline-flex items-center justify-center uppercase tracking-widest transition-colors focus:outline-none focus-visible:[box-shadow:var(--ring-outline)] disabled:cursor-not-allowed disabled:opacity-60 rounded-[var(--radius-md)] duration-[var(--duration-1)] ease-standard font-semibold';

const variants = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-bg)] hover:opacity-90 active:opacity-80',
  secondary: 'bg-transparent border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 active:bg-[var(--color-secondary)]/30',
  tertiary: 'bg-transparent border border-[var(--color-tertiary)] text-[var(--color-tertiary)] hover:bg-[var(--color-tertiary)]/10 active:bg-[var(--color-tertiary)]/20',
  ghost: 'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:bg-[var(--color-primary)]/20',
  destructive: 'bg-[var(--color-danger)] text-[var(--color-fg)] hover:opacity-90 active:opacity-80',
};

const sizes = {
  sm: 'px-[var(--space-3)] text-[var(--text-xs)] h-[var(--space-6)]',
  md: 'px-[var(--space-4)] text-[var(--text-sm)] h-[var(--space-7)]',
  lg: 'px-[var(--space-5)] text-[var(--text-md)] h-[var(--space-8)]',
};

type ButtonOwnProps<E extends ElementType = ElementType> = {
  as?: E;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

type ButtonProps<E extends ElementType> = ButtonOwnProps<E> &
  Omit<ComponentProps<E>, keyof ButtonOwnProps>;

const defaultElement = 'button';

export const Button = <E extends ElementType = typeof defaultElement>({
  as,
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...rest
}: ButtonProps<E>) => {
  const Component = as || defaultElement;

  const combinedClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};