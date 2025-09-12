import React from 'react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

const baseClasses = 'inline-flex items-center justify-center uppercase tracking-widest transition-colors focus:outline-none focus-visible:[box-shadow:var(--ring-outline)] disabled:cursor-not-allowed disabled:opacity-60 duration-200 ease-standard font-semibold rounded-radius-md';

const variants = {
  primary: 'bg-primary text-background hover:opacity-90 active:opacity-80',
  secondary: 'bg-transparent border border-secondary text-secondary hover:bg-secondary/20 active:bg-secondary/30',
  tertiary: 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary/10 active:bg-tertiary/20',
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20',
  destructive: 'bg-danger text-foreground hover:opacity-90 active:opacity-80',
  nav: 'rounded-none border-0 bg-transparent text-secondary hover:bg-secondary/20 active:bg-secondary/30',
  tab: 'rounded-b-none border-b-0 bg-transparent border border-secondary text-secondary hover:bg-secondary/20 active:bg-secondary/30',
};

const sizes = {
  sm: 'h-[var(--space-6)] px-[var(--space-3)] text-xs',
  md: 'h-[var(--space-8)] px-[var(--space-4)] text-sm',
  lg: 'h-[var(--space-10)] px-[var(--space-5)] text-md',
};

type ButtonOwnProps<E extends ElementType = ElementType> = {
  as?: E;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
  isActive?: boolean;
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
  isActive,
  ...rest
}: ButtonProps<E>) => {
  const Component = as || defaultElement;

  const activeClasses = (variant === 'nav' || variant === 'tab') && isActive ? 'bg-secondary text-background' : '';

  const combinedClasses = [
    baseClasses,
    variants[variant],
    sizes[size],
    activeClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
};
