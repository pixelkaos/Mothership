import React from 'react';
import type { ComponentProps, ElementType, ReactNode } from 'react';

// Using a simple object-based approach for variants and sizes.
const baseClasses = 'inline-flex items-center justify-center uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus disabled:cursor-not-allowed rounded-sm';

const variants = {
  primary: 'bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary/50 disabled:text-background/70',
  secondary: 'bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed disabled:border-secondary/50 disabled:text-secondary/50',
  tertiary: 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed active:border-tertiary-pressed disabled:border-tertiary/50 disabled:text-tertiary/50',
  ghost: 'bg-transparent text-muted hover:text-primary hover:bg-primary/10 active:bg-primary/20 disabled:text-muted/50',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
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
